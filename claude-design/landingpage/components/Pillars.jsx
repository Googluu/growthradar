
// EDA Pillars Section — E.D.A. unfolded
function Pillars({ accentColor }) {
  const green = accentColor || '#22c55e';

  const pillars = [
    {
      letter: 'E',
      title: 'Evalúa',
      desc: 'Auditamos tu sitio, redes y reseñas. Sabe exactamente cómo te ven Google y tus clientes.',
      icon: (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <circle cx="12" cy="12" r="7" stroke={green} strokeWidth="1.8"/>
          <path d="M17.5 17.5L23 23" stroke={green} strokeWidth="2" strokeLinecap="round"/>
          <path d="M9 12h6M12 9v6" stroke={green} strokeWidth="1.6" strokeLinecap="round"/>
        </svg>
      ),
      angle: '-3deg',
    },
    {
      letter: 'D',
      title: 'Descubre',
      desc: 'Encontramos negocios en tu zona y categoría que probablemente necesitan lo que ofreces.',
      icon: (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <circle cx="14" cy="14" r="9" stroke={green} strokeWidth="1.8"/>
          <path d="M14 5v2M14 21v2M5 14h2M21 14h2" stroke={green} strokeWidth="1.8" strokeLinecap="round"/>
          <circle cx="14" cy="14" r="2" fill={green}/>
          <path d="M14 14L18 8" stroke={green} strokeWidth="1.6" strokeLinecap="round"/>
        </svg>
      ),
      angle: '2deg',
    },
    {
      letter: 'A',
      title: 'Alcanza',
      desc: 'Generamos y enviamos un mensaje personalizado a cada prospecto. Conversaciones reales, automáticas.',
      icon: (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path d="M5 14L23 6l-8 18-2-7-8-3z" stroke={green} strokeWidth="1.8" strokeLinejoin="round" fill="none"/>
          <path d="M15 13l-3 3" stroke={green} strokeWidth="1.6" strokeLinecap="round"/>
        </svg>
      ),
      angle: '-1.5deg',
    },
  ];

  return (
    <section id="producto" style={{
      padding: '100px 24px',
      position: 'relative',
    }}>
      {/* Section label */}
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 72 }}>
          <div style={{
            fontFamily: 'Caveat, cursive', color: green, fontSize: 18,
            marginBottom: 12,
          }}>El método</div>
          <h2 style={{
            fontFamily: 'Syne, sans-serif', fontWeight: 800,
            fontSize: 'clamp(32px, 4vw, 52px)', color: '#fff',
            letterSpacing: '-0.03em', margin: 0,
          }}>Tres letras. Un sistema completo.</h2>
        </div>

        <div className="pillars-grid" style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 2, position: 'relative',
        }}>
          {pillars.map((p, i) => (
            <div key={i} style={{ position: 'relative' }}>
              {/* Sketchy divider between cards */}
              {i > 0 && (
                <div style={{
                  position: 'absolute', left: 0, top: '10%', bottom: '10%',
                  width: 1,
                  background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.1) 20%, rgba(255,255,255,0.1) 80%, transparent)',
                }}></div>
              )}
              <div
                className="pillar-card"
                style={{
                  background: 'rgba(255,255,255,0.025)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 20, padding: '48px 40px',
                  transition: 'all 0.3s',
                  cursor: 'default',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.borderColor = `${green}35`;
                  e.currentTarget.style.boxShadow = `0 0 40px ${green}10`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.025)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Big letter */}
                <div style={{
                  fontFamily: 'Caveat, cursive',
                  fontSize: 96, fontWeight: 700,
                  color: green, lineHeight: 1,
                  marginBottom: 8,
                  display: 'inline-block',
                  transform: `rotate(${p.angle})`,
                  opacity: 0.9,
                  textShadow: `0 0 40px ${green}40`,
                }}>{p.letter}</div>

                {/* Icon */}
                <div style={{ marginBottom: 16, opacity: 0.85 }}>{p.icon}</div>

                {/* Title */}
                <h3 style={{
                  fontFamily: 'Syne, sans-serif', fontWeight: 700,
                  fontSize: 28, color: '#fff', margin: '0 0 12px',
                  letterSpacing: '-0.02em',
                }}>{p.title}</h3>

                {/* Description */}
                <p style={{
                  fontFamily: 'Inter, sans-serif', fontSize: 15,
                  lineHeight: 1.7, color: 'rgba(255,255,255,0.5)',
                  margin: 0,
                }}>{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { Pillars });
