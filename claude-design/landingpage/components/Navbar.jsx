
// EDA Navbar Component
const { useState, useEffect } = React;

function Navbar({ accentColor }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const links = ['Producto', 'Precios', 'Casos', 'Blog'];

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      transition: 'all 0.3s ease',
      background: scrolled ? 'rgba(10,10,10,0.85)' : 'transparent',
      backdropFilter: scrolled ? 'blur(16px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', height: 68,
      }}>
        {/* Logo */}
        <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <img src="uploads/logo_eda_sin_background.png" alt="EDA" style={{ height: 36, width: 36, filter: 'brightness(1.1)' }} />
          <img src="uploads/eda.png" alt="EDA" style={{ height: 22, filter: 'invert(1) brightness(2)' }} />
        </a>

        {/* Desktop links */}
        <div style={{ display: 'flex', gap: 32, alignItems: 'center' }} className="nav-desktop">
          {links.map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} style={{
              color: 'rgba(255,255,255,0.65)', fontSize: 14, textDecoration: 'none',
              fontFamily: 'Inter, sans-serif', letterSpacing: '0.01em',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.target.style.color = '#fff'}
            onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.65)'}
            >{l}</a>
          ))}
        </div>

        {/* CTA buttons */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }} className="nav-desktop">
          <a href="#" style={{
            color: 'rgba(255,255,255,0.75)', fontSize: 14, textDecoration: 'none',
            padding: '8px 16px', border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 8, fontFamily: 'Inter, sans-serif',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.target.style.borderColor = 'rgba(255,255,255,0.35)'; e.target.style.color = '#fff'; }}
          onMouseLeave={e => { e.target.style.borderColor = 'rgba(255,255,255,0.15)'; e.target.style.color = 'rgba(255,255,255,0.75)'; }}
          >Iniciar sesión</a>
          <a href="#" style={{
            background: accentColor || '#22c55e', color: '#0a0a0a',
            fontSize: 14, textDecoration: 'none', fontWeight: 700,
            padding: '8px 18px', borderRadius: 8, fontFamily: 'Inter, sans-serif',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={e => e.target.style.opacity = '0.88'}
          onMouseLeave={e => e.target.style.opacity = '1'}
          >Empezar gratis</a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="nav-mobile"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#fff', padding: 8, display: 'none',
          }}
          aria-label="Menú"
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            {mobileOpen ? (
              <path d="M4 4L18 18M18 4L4 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            ) : (
              <>
                <line x1="3" y1="7" x2="19" y2="7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                <line x1="3" y1="11" x2="19" y2="11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                <line x1="3" y1="15" x2="19" y2="15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{
          background: '#111', borderTop: '1px solid rgba(255,255,255,0.08)',
          padding: '16px 24px 24px',
        }} className="nav-mobile-menu">
          {links.map(l => (
            <a key={l} href={`#${l.toLowerCase()}`}
              onClick={() => setMobileOpen(false)}
              style={{
                display: 'block', color: 'rgba(255,255,255,0.75)', fontSize: 16,
                textDecoration: 'none', padding: '12px 0',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                fontFamily: 'Inter, sans-serif',
              }}
            >{l}</a>
          ))}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
            <a href="#" style={{
              color: '#fff', fontSize: 14, textDecoration: 'none',
              padding: '10px 16px', border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 8, fontFamily: 'Inter, sans-serif', textAlign: 'center',
            }}>Iniciar sesión</a>
            <a href="#" style={{
              background: accentColor || '#22c55e', color: '#0a0a0a',
              fontSize: 14, textDecoration: 'none', fontWeight: 700,
              padding: '10px 16px', borderRadius: 8, fontFamily: 'Inter, sans-serif', textAlign: 'center',
            }}>Empezar gratis</a>
          </div>
        </div>
      )}
    </nav>
  );
}

Object.assign(window, { Navbar });
