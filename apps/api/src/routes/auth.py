"""
Endpoints de autenticación.
Por ahora solo /me para verificar que el middleware JWT funciona.
En fases siguientes se agregarán endpoints que usen el user_id para
asociar empresas y auditorías al usuario autenticado.
"""

from fastapi import APIRouter, Depends

from src.middleware.auth import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/me")
def me(user: dict = Depends(get_current_user)):
    """
    Retorna el perfil básico del usuario autenticado.
    Útil para verificar que el token es válido desde el frontend.
    """
    return {
        "user_id": user.get("sub"),
        "email": user.get("email"),
        "role": user.get("role"),
    }
