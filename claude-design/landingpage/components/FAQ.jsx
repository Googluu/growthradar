
// EDA FAQ Section
function FAQ({ accentColor }) {
  const green = accentColor || '#22c55e';
  const [open, setOpen] = React.useState(null);

  const faqs = [
    {
      q: '¿Cómo funciona la auditoría?',
      a: 'Ingresás la URL de tu negocio o su nombre en Google. EDA analiza tu sitio web (velocidad, SEO técnico, mobile), tu perfil de Google Business, tus reseñas, y tu presencia en redes. En 90 segundos tenés un reporte con score por categoría y acciones priorizadas.',
    },
    {
      q: '¿De dónde sacan los datos de mi negocio?',
      a: 'Usamos fuentes públicas: Google Search Console API, Google Places, datos de rendimiento web (Core Web Vitals), y directorios de negocios locales. No accedemos a ningún sistema privado sin tu autorización explícita.',
    },
    {
      q: '¿El outreach por correo es legal en mi país?',
      a: 'EDA cumple con las regulaciones de privacidad de cada país donde opera, incluyendo LFPDPPP (México), Ley de Habeas Data (Colombia), y marcos equivalentes en Perú, Chile y Argentina. Solo contactamos negocios con información pública disponible, y cada mensaje incluye opción de exclusión.',
    },
    {
      q: '¿Puedo cancelar cuando quiera?',
      a: 'Sí, sin preguntas. Podés cancelar desde tu panel en cualquier momento. Si pagaste anual, te devolvemos el proporcional del tiempo no usado.',
    },
    {
      q: '¿Qué pasa si no tengo sitio web?',
      a: 'No pasa nada. EDA puede hacer una auditoría basada únicamente en tu perfil de Google Business. De hecho, te damos recomendaciones específicas para que tengas presencia digital básica incluso sin sitio propio.',
    },
    {
      q: '¿Cuántos clientes necesito para que valga la pena?',
      a: 'Con un solo cliente nuevo que cierre gracias a EDA, el plan Starter se paga solo. La mayoría de los negocios que usan EDA recuperan su inversión en la primera semana. Si no ves resultados en 14 días, te devolvemos el dinero.',
    },
    {
      q: '¿Funciona para mi categoría de negocio?',
      a: 'EDA funciona para cualquier negocio local con clientes B2B o B2C: restaurantes, clínicas, ferreterías, estudios contables, agencias, talleres mecánicos, salones de belleza, y más. Si tu negocio puede aparecer en Google, EDA puede auditarlo.',
    },
    {
      q: '¿Tienen integración con WhatsApp?',
      a: 'Sí, en el plan Growth. Integramos con WhatsApp Business API para enviar mensajes de outreach directamente por WhatsApp, con seguimiento de respuestas desde el dashboard de EDA.',
    },
  ];

  return (
    <section style={{ padding: '100px 24px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ fontFamily: 'Caveat, cursive', color: green, fontSize: 18, marginBottom: 12 }}>
            FAQ
          </div>
          <h2 style={{
            fontFamily: 'Syne, sans-serif', fontWeight: 800,
            fontSize: 'clamp(28px, 3.5vw, 44px)', color: '#fff',
            letterSpacing: '-0.03em', margin: 0,
          }}>Preguntas frecuentes</h2>
        </div>

        {/* Accordion */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {faqs.map((faq, i) => (
            <div key={i} style={{
              border: `1px solid ${open === i ? green + '35' : 'rgba(255,255,255,0.07)'}`,
              borderRadius: 12,
              background: open === i ? 'rgba(34,197,94,0.04)' : 'rgba(255,255,255,0.02)',
              transition: 'all 0.25s',
              overflow: 'hidden',
            }}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{
                  width: '100%', background: 'none', border: 'none',
                  cursor: 'pointer', padding: '18px 22px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  gap: 16, textAlign: 'left',
                }}
              >
                <span style={{
                  fontFamily: 'Inter, sans-serif', fontWeight: 600,
                  fontSize: 15, color: '#fff', lineHeight: 1.4,
                }}>{faq.q}</span>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: open === i ? `${green}20` : 'rgba(255,255,255,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, transition: 'all 0.25s',
                }}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
                    style={{ transform: open === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s' }}>
                    <path d="M2 3.5l3 3 3-3" stroke={open === i ? green : 'rgba(255,255,255,0.5)'}
                      strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </button>

              {open === i && (
                <div style={{ padding: '0 22px 20px' }}>
                  <p style={{
                    fontFamily: 'Inter, sans-serif', fontSize: 14,
                    color: 'rgba(255,255,255,0.55)', lineHeight: 1.75,
                    margin: 0,
                  }}>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { FAQ });
