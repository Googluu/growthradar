
// EDA Pricing Section
function Pricing({ accentColor }) {
  const green = accentColor || '#22c55e';
  const [annual, setAnnual] = React.useState(false);

  const plans = [
    {
      name: 'Free',
      price: 0,
      desc: 'Para empezar a entender tu presencia digital.',
      features: [
        '1 auditoría por mes',
        'Ver hasta 10 prospectos',
        'Reporte básico de salud digital',
        'Sin outreach automático',
      ],
      cta: 'Empezar gratis',
      ctaStyle: 'outline',
      popular: false,
    },
    {
      name: 'Starter',
      price: 29,
      desc: 'Para pymes que quieren crecer con consistencia.',
      features: [
        '10 auditorías por mes',
        '100 prospectos por mes',
        '50 mensajes de outreach',
        'Soporte por chat',
        'Exportar reportes en PDF',
      ],
      cta: 'Probar 14 días gratis',
      ctaStyle: 'primary',
      popular: true,
    },
    {
      name: 'Growth',
      price: 79,
      desc: 'Para equipos con procesos de ventas activos.',
      features: [
        '50 auditorías por mes',
        '1,000 prospectos por mes',
        '500 mensajes de outreach',
        'Integraciones CRM y WhatsApp Business',
        'Soporte prioritario',
        'Acceso API',
      ],
      cta: 'Hablar con ventas',
      ctaStyle: 'outline',
      popular: false,
    },
  ];

  return (
    <section id="precios" style={{ padding: '100px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ fontFamily: 'Caveat, cursive', color: green, fontSize: 18, marginBottom: 12 }}>
            Precios
          </div>
          <h2 style={{
            fontFamily: 'Syne, sans-serif', fontWeight: 800,
            fontSize: 'clamp(28px, 3.5vw, 48px)', color: '#fff',
            letterSpacing: '-0.03em', margin: '0 0 8px',
          }}>Precios simples</h2>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: 16,
            color: 'rgba(255,255,255,0.45)', margin: '0 0 28px',
          }}>Empieza gratis. Crece a tu ritmo.</p>

          {/* Annual toggle */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: !annual ? '#fff' : 'rgba(255,255,255,0.4)' }}>Mensual</span>
            <button
              onClick={() => setAnnual(!annual)}
              style={{
                width: 44, height: 24, borderRadius: 12,
                background: annual ? green : 'rgba(255,255,255,0.12)',
                border: 'none', cursor: 'pointer', position: 'relative',
                transition: 'background 0.3s',
              }}
            >
              <div style={{
                position: 'absolute', top: 3, left: annual ? 23 : 3,
                width: 18, height: 18, borderRadius: '50%',
                background: '#fff', transition: 'left 0.3s',
              }}></div>
            </button>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: annual ? '#fff' : 'rgba(255,255,255,0.4)' }}>
              Anual
              <span style={{
                marginLeft: 6, background: `${green}20`, color: green,
                fontSize: 11, fontWeight: 600, padding: '2px 6px',
                borderRadius: 20, border: `1px solid ${green}30`,
              }}>−15%</span>
            </span>
          </div>
        </div>

        {/* Plans grid */}
        <div className="pricing-grid" style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16,
          alignItems: 'start',
        }}>
          {plans.map((plan, i) => {
            const displayPrice = annual && plan.price > 0
              ? Math.round(plan.price * 0.85)
              : plan.price;

            return (
              <div key={i} style={{
                background: plan.popular ? 'rgba(34,197,94,0.06)' : 'rgba(255,255,255,0.025)',
                border: plan.popular ? `1.5px solid ${green}50` : '1px solid rgba(255,255,255,0.08)',
                borderRadius: 20, padding: '32px 28px',
                position: 'relative',
                boxShadow: plan.popular ? `0 0 40px ${green}12` : 'none',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                {/* Popular badge */}
                {plan.popular && (
                  <div style={{
                    position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                    background: green, color: '#0a0a0a', fontFamily: 'Inter, sans-serif',
                    fontWeight: 700, fontSize: 11, padding: '4px 14px',
                    borderRadius: 20, whiteSpace: 'nowrap', letterSpacing: '0.04em',
                  }}>MÁS POPULAR</div>
                )}

                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: '#fff', marginBottom: 4 }}>
                  {plan.name}
                </div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 24, lineHeight: 1.5 }}>
                  {plan.desc}
                </div>

                {/* Price */}
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, marginBottom: 28 }}>
                  {plan.price === 0 ? (
                    <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 44, color: '#fff', lineHeight: 1 }}>Gratis</span>
                  ) : (
                    <>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>$</span>
                      <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 48, color: '#fff', lineHeight: 1 }}>{displayPrice}</span>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>USD/mes</span>
                    </>
                  )}
                </div>

                {/* CTA */}
                <a href="#" style={{
                  display: 'block', textAlign: 'center', textDecoration: 'none',
                  padding: '12px 0', borderRadius: 10, marginBottom: 24,
                  fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 14,
                  background: plan.ctaStyle === 'primary' ? green : 'transparent',
                  color: plan.ctaStyle === 'primary' ? '#0a0a0a' : 'rgba(255,255,255,0.8)',
                  border: plan.ctaStyle === 'primary' ? 'none' : '1px solid rgba(255,255,255,0.2)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  if (plan.ctaStyle === 'primary') {
                    e.currentTarget.style.opacity = '0.88';
                  } else {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)';
                    e.currentTarget.style.color = '#fff';
                  }
                }}
                onMouseLeave={e => {
                  if (plan.ctaStyle === 'primary') {
                    e.currentTarget.style.opacity = '1';
                  } else {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
                  }
                }}
                >{plan.cta}</a>

                {/* Features */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {plan.features.map((f, j) => (
                    <div key={j} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <svg style={{ flexShrink: 0, marginTop: 2 }} width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <circle cx="7" cy="7" r="6" fill={`${green}20`}/>
                        <path d="M4.5 7l2 2L9.5 5" stroke={green} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer notes */}
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.35)', margin: '0 0 8px' }}>
            Precios en USD. Facturación mensual o anual (15% descuento). Cancela cuando quieras.
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.35)', margin: 0 }}>
            ¿Necesitas algo a medida?{' '}
            <a href="#" style={{ color: green, textDecoration: 'none' }}>
              Tenemos plan Agencia (multi-cliente, white-label) — contáctanos
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { Pricing });
