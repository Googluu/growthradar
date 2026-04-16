"""
Middleware de autenticación — verifica JWTs emitidos por Supabase.

Uso en un endpoint protegido:
    from src.middleware.auth import get_current_user

    @router.get("/me")
    async def me(user: dict = Depends(get_current_user)):
        return {"user_id": user["sub"]}

Supabase emite JWTs firmados con HS256 usando el JWT Secret del proyecto.
El token incluye el claim "sub" con el UUID del usuario.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import ExpiredSignatureError, JWTError, jwt

from src.config import settings

# HTTPBearer extrae el token del header "Authorization: Bearer <token>"
# auto_error=False para poder devolver 401 personalizado en lugar del 403 por defecto
_bearer = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> dict:
    """
    Dependency de FastAPI — verifica el JWT y retorna el payload decodificado.

    Errores:
    - 401 si no hay token en el header
    - 403 si el token es inválido, expirado o con firma incorrecta
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de autenticación requerido",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            # Supabase incluye "aud": "authenticated" en todos los tokens de usuario
            options={"verify_aud": False},
        )
    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Token expirado",
        )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Token inválido",
        )

    return payload
