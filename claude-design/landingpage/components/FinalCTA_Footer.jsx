
// EDA Final CTA + Footer
function FinalCTA({ accentColor }) {
  const green = accentColor || '#22c55e';

  return (
    <section style={{
      padding: '120px 24px',
      position: 'relative', overflow: 'hidden',
      background: '#0d0d0d',
      borderTop: '1px solid rgba(255,255,255,0.06)',
    }}>
      {/* Green glow */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 600, height: 400,
        background: `radial-gradient(ellipse, ${green}18 0%, transparent 70%)`,
        pointerEvents: 'none',
      }}></div>

      {/* Sketchy circle decoration */}
      <div style={{
        position: 'absolute', right: '-80px', top: '50%',
        transform: 'translateY(-50%)',
        opacity: 0.06, pointerEvents: 'none',
      }}>
        <img src="uploads/logo_eda_sin_background.png" alt="" style={{ width: 400, height: 400, filter: 'grayscale(1) invert(1)' }} />
      </div>
      <div style={{
        position: 'absolute', left: '-80px', top: '50%',
        transform: 'translateY(-50%)',
        opacity: 0.04, pointerEvents: 'none',
      }}>
        <img src="uploads/logo_eda_sin_background.png" alt="" style={{ width: 300, height: 300, filter: 'grayscale(1) invert(1)' }} />
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ fontFamily: 'Caveat, cursive', color: green, fontSize: 20, marginBottom: 16 }}>
          Listo para empezar
        </div>
        <h2 style={{
          fontFamily: 'Syne, sans-serif', fontWeight: 800,
          fontSize: 'clamp(36px, 5vw, 64px)', color: '#fff',
          letterSpacing: '-0.03em', lineHeight: 1.05,
          margin: '0 0 20px',
        }}>
          Empieza a crecer<br/>
          <span style={{ color: green }}>en 90 segundos.</span>
        </h2>
        <p style={{
          fontFamily: 'Inter, sans-serif', fontSize: 18,
          color: 'rgba(255,255,255,0.5)', margin: '0 0 40px', lineHeight: 1.6,
        }}>
          Tu primera auditoría es gratis. No necesitas tarjeta.
        </p>
        <a href="#" style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          background: green, color: '#0a0a0a',
          fontFamily: 'Inter, sans-serif', fontWeight: 700,
          fontSize: 17, padding: '16px 36px',
          borderRadius: 12, textDecoration: 'none',
          boxShadow: `0 0 0 0 ${green}40`,
          transition: 'transform 0.15s, box-shadow 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 12px 40px ${green}45`; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 0 0 0 ${green}40`; }}
        >
          Audita tu negocio →
        </a>
      </div>
    </section>
  );
}

function Footer({ accentColor }) {
  const green = accentColor || '#22c55e';

  const cols = [
    {
      title: null,
      isLogo: true,
    },
    {
      title: 'Producto',
      links: ['Características', 'Precios', 'Cambios', 'Roadmap'],
    },
    {
      title: 'Empresa',
      links: ['Sobre nosotros', 'Blog', 'Casos de éxito', 'Contacto'],
    },
    {
      title: 'Legal',
      links: ['Términos', 'Privacidad', 'Cookies', 'GDPR / LFPDPPP / Habeas Data'],
    },
  ];

  const socials = [
    {
      name: 'X',
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M12.6 1.5h2.3L9.8 7.1 15.7 14.5H11l-3.7-4.9-4.3 4.9H.6l5.5-6.3L.3 1.5h4.8l3.4 4.5 4.1-4.5zm-.8 11.7h1.3L4.2 2.8H2.8l9 10.4z"/>
        </svg>
      ),
    },
    {
      name: 'LinkedIn',
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M0 1.1C0 .5.5 0 1.2 0h13.6C15.5 0 16 .5 16 1.1v13.7c0 .7-.5 1.2-1.2 1.2H1.2C.5 16 0 15.5 0 14.8V1.1zm4.9 11.9V6.2H2.6v6.8h2.3zm-1.1-7.7c.8 0 1.3-.5 1.3-1.2C5 3.4 4.5 2.9 3.8 2.9c-.8 0-1.3.5-1.3 1.2 0 .7.5 1.2 1.3 1.2zm9.2 7.7V8.9c0-2.1-1.1-3-2.6-3-1.2 0-1.8.7-2.1 1.1V6.2H6v6.8h2.3V9c0-.2 0-.4.1-.5.2-.4.6-.9 1.3-.9.9 0 1.3.7 1.3 1.7v3.7H13z"/>
        </svg>
      ),
    },
    {
      name: 'YouTube',
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M15.8 4.8s-.2-1.3-.8-1.9c-.7-.8-1.6-.8-2-.8C11 2 8 2 8 2s-3 0-5 .1c-.4 0-1.3 0-2 .8C.4 3.5.2 4.8.2 4.8S0 6.3 0 7.8v1.4c0 1.5.2 3 .2 3s.2 1.3.8 1.9c.7.8 1.7.7 2.2.8C4.8 15 8 15 8 15s3 0 5-.1c.4 0 1.3 0 2-.8.6-.6.8-1.9.8-1.9s.2-1.5.2-3V7.8c0-1.5-.2-3-.2-3zM6.4 10.3V5.7l5 2.3-5 2.3z"/>
        </svg>
      ),
    },
  ];

  return (
    <footer style={{
      borderTop: '1px solid rgba(255,255,255,0.06)',
      padding: '64px 24px 32px',
      background: '#0a0a0a',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Main columns */}
        <div className="footer-grid" style={{
          display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr',
          gap: 48, marginBottom: 48,
        }}>
          {/* Logo col */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <img src="uploads/logo_eda_sin_background.png" alt="EDA" style={{ height: 40, width: 40 }} />
              <img src="uploads/eda.png" alt="EDA" style={{ height: 22, filter: 'invert(1) brightness(2)' }} />
            </div>
            <div style={{
              fontFamily: 'Caveat, cursive', color: green,
              fontSize: 18, marginBottom: 10,
            }}>Evalúa. Descubre. Alcanza.</div>
            <p style={{
              fontFamily: 'Inter, sans-serif', fontSize: 13,
              color: 'rgba(255,255,255,0.35)', lineHeight: 1.65,
              margin: 0, maxWidth: 240,
            }}>
              La plataforma de visibilidad digital y prospección automática para pymes de LATAM.
            </p>
          </div>

          {/* Link cols */}
          {cols.slice(1).map((col, i) => (
            <div key={i}>
              <div style={{
                fontFamily: 'Syne, sans-serif', fontWeight: 700,
                fontSize: 13, color: 'rgba(255,255,255,0.7)',
                marginBottom: 16, letterSpacing: '0.04em',
              }}>{col.title}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {col.links.map((link, j) => (
                  <a key={j} href="#" style={{
                    fontFamily: 'Inter, sans-serif', fontSize: 13,
                    color: 'rgba(255,255,255,0.38)', textDecoration: 'none',
                    transition: 'color 0.2s', lineHeight: 1.4,
                  }}
                  onMouseEnter={e => e.target.style.color = 'rgba(255,255,255,0.75)'}
                  onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.38)'}
                  >{link}</a>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom strip */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingTop: 24, display: 'flex',
          justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: 16,
        }}>
          <span style={{
            fontFamily: 'Inter, sans-serif', fontSize: 12,
            color: 'rgba(255,255,255,0.25)',
          }}>© 2026 EDA · Hecho en Latinoamérica 🌎</span>

          <div style={{ display: 'flex', gap: 12 }}>
            {socials.map((s, i) => (
              <a key={i} href="#" aria-label={s.name} style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'rgba(255,255,255,0.4)', textDecoration: 'none',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = `${green}20`; e.currentTarget.style.color = green; e.currentTarget.style.borderColor = `${green}40`; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
              >{s.icon}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, { FinalCTA, Footer });
