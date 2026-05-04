
// EDA Hero Section
function Hero({ accentColor }) {
  const green = accentColor || '#22c55e';

  return (
    <section style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center',
      position: 'relative', overflow: 'hidden',
      padding: '120px 24px 80px',
    }}>
      {/* Background dot grid */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)`,
        backgroundSize: '32px 32px',
        maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
      }}></div>

      {/* Green glow blob */}
      <div style={{
        position: 'absolute', top: '10%', right: '-5%',
        width: 600, height: 600,
        background: `radial-gradient(circle, ${green}18 0%, transparent 70%)`,
        pointerEvents: 'none',
        borderRadius: '50%',
      }}></div>
      <div style={{
        position: 'absolute', bottom: '0%', left: '-10%',
        width: 400, height: 400,
        background: `radial-gradient(circle, ${green}0d 0%, transparent 70%)`,
        pointerEvents: 'none',
        borderRadius: '50%',
      }}></div>

      <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <div className="hero-grid" style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 64, alignItems: 'center',
        }}>
          {/* Left: Text */}
          <div className="fade-up" style={{ maxWidth: 560 }}>
            {/* Kicker */}
            <div style={{
              fontFamily: 'Caveat, cursive',
              color: green, fontSize: 20,
              marginBottom: 20,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 2 Q12 6 10 10 Q8 14 10 18" stroke={green} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                <path d="M7 8 Q10 6 13 8" stroke={green} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
              </svg>
              Para pymes de Latinoamérica
            </div>

            {/* Headline */}
            <h1 style={{
              fontFamily: 'Syne, sans-serif',
              fontWeight: 800, fontSize: 'clamp(40px, 5vw, 68px)',
              lineHeight: 1.05, letterSpacing: '-0.03em',
              color: '#fff', margin: '0 0 24px',
            }}>
              Tu negocio en Google.{' '}
              <span style={{ color: green }}>Visible,</span>{' '}
              conectado, creciendo.
            </h1>

            {/* Subhead */}
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 18, lineHeight: 1.65,
              color: 'rgba(255,255,255,0.58)',
              margin: '0 0 36px', maxWidth: 480,
            }}>
              EDA escanea tu presencia digital, encuentra clientes potenciales que necesitan lo que ofreces, y los contacta por ti — todo en automático.
            </p>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 20 }}>
              <a href="#" style={{
                background: green, color: '#0a0a0a',
                fontFamily: 'Inter, sans-serif', fontWeight: 700,
                fontSize: 15, padding: '14px 28px',
                borderRadius: 10, textDecoration: 'none',
                display: 'inline-flex', alignItems: 'center', gap: 8,
                transition: 'transform 0.15s, box-shadow 0.15s',
                boxShadow: `0 0 0 0 ${green}40`,
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 8px 32px ${green}40`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 0 0 0 ${green}40`; }}
              >
                Audita tu negocio gratis
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>

              <a href="#" style={{
                color: 'rgba(255,255,255,0.8)',
                fontFamily: 'Inter, sans-serif', fontWeight: 500,
                fontSize: 15, padding: '14px 22px',
                borderRadius: 10, textDecoration: 'none',
                border: '1px solid rgba(255,255,255,0.15)',
                display: 'inline-flex', alignItems: 'center', gap: 8,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M6.5 5.5l4 2.5-4 2.5V5.5z" fill="currentColor"/>
                </svg>
                Ver demo
              </a>
            </div>

            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 13, color: 'rgba(255,255,255,0.35)',
              letterSpacing: '0.01em',
            }}>
              Sin tarjeta de crédito · Resultados en 90 segundos
            </p>
          </div>

          {/* Right: Dashboard mockup */}
          <div className="hero-mockup fade-up-delay" style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            position: 'relative',
          }}>
            {/* Glow behind mockup */}
            <div style={{
              position: 'absolute', width: '80%', height: '60%',
              background: `radial-gradient(ellipse, ${green}22 0%, transparent 70%)`,
              borderRadius: '50%', filter: 'blur(24px)',
              zIndex: 0,
            }}></div>

            {/* Browser window mockup */}
            <div style={{
              position: 'relative', zIndex: 1,
              background: '#111',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 16,
              boxShadow: `0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05), 0 0 60px ${green}15`,
              width: '100%', maxWidth: 500,
              transform: 'perspective(1000px) rotateY(-4deg) rotateX(2deg)',
              overflow: 'hidden',
            }}>
              {/* Browser chrome */}
              <div style={{
                background: '#1a1a1a', padding: '12px 16px',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['#ff5f57','#ffbd2e','#28c840'].map((c, i) => (
                    <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c }}></div>
                  ))}
                </div>
                <div style={{
                  flex: 1, background: 'rgba(255,255,255,0.06)',
                  borderRadius: 6, padding: '5px 12px',
                  fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.4)',
                }}>
                  app.eda.lat/dashboard
                </div>
              </div>

              {/* Dashboard content */}
              <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: '#fff' }}>
                    Pizzería Don Mario
                  </div>
                  <div style={{
                    background: `${green}20`, color: green,
                    fontSize: 11, fontFamily: 'Inter, sans-serif', fontWeight: 600,
                    padding: '3px 8px', borderRadius: 20, border: `1px solid ${green}40`,
                  }}>Activo</div>
                </div>

                {/* Score card */}
                <div style={{
                  background: 'rgba(255,255,255,0.04)', borderRadius: 12,
                  padding: 16, border: '1px solid rgba(255,255,255,0.07)',
                }}>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.45)', marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    Salud Digital
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                    <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 42, color: '#fff', lineHeight: 1 }}>65</span>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, color: 'rgba(255,255,255,0.35)', marginBottom: 6 }}>/100</span>
                  </div>
                  {/* Progress bar */}
                  <div style={{ marginTop: 10, background: 'rgba(255,255,255,0.08)', borderRadius: 4, height: 5, overflow: 'hidden' }}>
                    <div style={{ width: '65%', height: '100%', background: green, borderRadius: 4 }}></div>
                  </div>
                </div>

                {/* Stat cards row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    { label: 'Prospectos', value: '12', sub: 'encontrados hoy', icon: '🎯' },
                    { label: 'Mensajes', value: '3', sub: 'enviados', icon: '✉️' },
                  ].map((s, i) => (
                    <div key={i} style={{
                      background: 'rgba(255,255,255,0.03)', borderRadius: 10,
                      padding: '12px 14px', border: '1px solid rgba(255,255,255,0.06)',
                    }}>
                      <div style={{ fontSize: 18, marginBottom: 4 }}>{s.icon}</div>
                      <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 22, color: '#fff' }}>{s.value}</div>
                      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{s.label} · {s.sub}</div>
                    </div>
                  ))}
                </div>

                {/* Recommendation */}
                <div style={{
                  background: `${green}10`, borderRadius: 10,
                  padding: '12px 14px', border: `1px solid ${green}25`,
                  display: 'flex', gap: 10, alignItems: 'flex-start',
                }}>
                  <div style={{ color: green, fontSize: 14, marginTop: 1 }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <circle cx="7" cy="7" r="6" stroke={green} strokeWidth="1.4"/>
                      <path d="M7 4v3.5l2 1.5" stroke={green} strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 600, color: green, marginBottom: 2 }}>
                      Acción recomendada
                    </div>
                    <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
                      Actualiza tu perfil de Google Business con horarios
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { Hero });
