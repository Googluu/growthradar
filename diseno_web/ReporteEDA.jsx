// ReporteEDA.jsx — Sección de reporte de auditoría digital EDA
// Datos reales: dian.gov.co · CrUX + DataForSEO + Claude AI

const { useState, useEffect, useRef } = React;

// ─── Keyframes ────────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@400;500;600&display=swap');

  @keyframes arcDraw {
    from { stroke-dashoffset: 502; }
    to   { stroke-dashoffset: 100; }
  }
  @keyframes barGrow {
    from { width: 0%; }
    to   { width: var(--bar-w); }
  }
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.3; }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(93,184,72,0.4); }
    50%      { box-shadow: 0 0 0 8px rgba(93,184,72,0); }
  }
  .eda-fade-up { animation: fadeUp 0.6s ease forwards; }
  .eda-blink   { animation: blink 1.4s ease-in-out infinite; }
  .eda-pulse   { animation: pulse 2s ease-in-out infinite; }

  .eda-btn-primary {
    background: #5DB848; color: #fff; border: none;
    padding: 14px 28px; border-radius: 8px;
    font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 600;
    cursor: pointer; transition: filter 0.15s, transform 0.15s;
  }
  .eda-btn-primary:hover { filter: brightness(1.1); transform: translateY(-1px); }
  .eda-btn-outline {
    background: transparent; color: #9aad8a;
    border: 1px solid rgba(255,255,255,0.12);
    padding: 14px 28px; border-radius: 8px;
    font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 500;
    cursor: pointer; transition: all 0.15s;
  }
  .eda-btn-outline:hover { border-color: rgba(255,255,255,0.28); color: #fff; }

  .eda-metric-bar {
    height: 4px; border-radius: 2px; background: rgba(255,255,255,0.07);
    overflow: hidden; margin-top: 6px;
  }
  .eda-metric-bar-fill {
    height: 100%; border-radius: 2px;
    animation: barGrow 1s cubic-bezier(0.16,1,0.3,1) forwards;
    animation-play-state: paused;
  }
  .eda-metric-bar-fill.started {
    animation-play-state: running;
  }

  .eda-rec-card {
    border-radius: 12px; padding: 24px;
    background: #131508;
    transition: transform 0.2s;
  }
  .eda-rec-card:hover { transform: translateY(-2px); }

  .eda-check-row {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 0; border-bottom: 1px solid rgba(255,255,255,0.05);
    font-family: 'DM Sans'; font-size: 13px;
  }
  .eda-check-row:last-child { border-bottom: none; }
`;

// ─── Score Ring SVG ───────────────────────────────────────────────────────────
function ScoreRing({ score = 80, started }) {
  const r = 80;
  const circ = 2 * Math.PI * r;           // ≈ 502.65
  const fill = circ * (1 - score / 100);  // dashoffset for "filled" arc
  const color = score >= 75 ? '#5DB848' : score >= 50 ? '#F5C842' : '#E53935';

  return (
    <div style={{ position:'relative', width:200, height:200, flexShrink:0 }}>
      <svg width="200" height="200" viewBox="0 0 200 200" style={{ transform:'rotate(-90deg)' }}>
        <defs>
          <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#5DB848" />
            <stop offset="100%" stopColor="#A3C94A" />
          </linearGradient>
        </defs>
        {/* Track */}
        <circle cx="100" cy="100" r={r}
          fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
        {/* Arc */}
        <circle cx="100" cy="100" r={r}
          fill="none"
          stroke="url(#arcGrad)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={started ? fill : circ}
          style={{ transition: started ? 'stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)' : 'none' }}
        />
      </svg>
      {/* Center label */}
      <div style={{
        position:'absolute', inset:0, display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center',
      }}>
        <span style={{ fontFamily:'Syne', fontWeight:800, fontSize:44, color, lineHeight:1 }}>{score}</span>
        <span style={{ color:'rgba(255,255,255,0.35)', fontSize:12, marginTop:2 }}>/ 100</span>
      </div>
    </div>
  );
}

// ─── Metric Row ───────────────────────────────────────────────────────────────
function MetricBar({ label, value, status, barPct, started }) {
  const colors = { good:'#5DB848', needs_improvement:'#F5C842', poor:'#E53935' };
  const labels = { good:'BUENO', needs_improvement:'MEJORAR', poor:'CRÍTICO' };
  const dots   = { good:'🟢', needs_improvement:'🟡', poor:'🔴' };
  const c = colors[status] || '#5DB848';
  return (
    <div style={{ paddingBottom:10, marginBottom:2 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ fontFamily:'DM Sans', fontSize:13, color:'rgba(255,255,255,0.5)' }}>{label}</span>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontFamily:'monospace', fontSize:13, fontWeight:700, color:'rgba(255,255,255,0.85)' }}>{value}</span>
          <span style={{ fontSize:10, color:c, fontWeight:700, display:'flex', alignItems:'center', gap:4 }}>
            {dots[status]} {labels[status]}
          </span>
        </div>
      </div>
      <div className="eda-metric-bar">
        <div
          className={`eda-metric-bar-fill${started ? ' started' : ''}`}
          style={{ '--bar-w': `${barPct}%`, background: c }}
        />
      </div>
    </div>
  );
}

// ─── Check Row ────────────────────────────────────────────────────────────────
function CheckRow({ ok, label }) {
  return (
    <div className="eda-check-row">
      <span style={{
        width:18, height:18, borderRadius:'50%',
        display:'flex', alignItems:'center', justifyContent:'center',
        background: ok ? 'rgba(93,184,72,0.18)' : 'rgba(229,57,53,0.15)',
        fontSize:10, flexShrink:0,
      }}>
        {ok ? <span style={{ color:'#5DB848' }}>✓</span> : <span style={{ color:'#E53935' }}>✕</span>}
      </span>
      <span style={{ color: ok ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.45)' }}>{label}</span>
    </div>
  );
}

// ─── Recommendation Card ──────────────────────────────────────────────────────
function RecCard({ rec, accent, delay }) {
  return (
    <div className="eda-rec-card eda-fade-up"
      style={{ border:`1px solid ${accent}44`, animationDelay:`${delay}ms` }}>
      {/* Badge */}
      <div style={{ display:'flex', gap:8, marginBottom:16, alignItems:'center' }}>
        <span style={{
          background: accent + '1A', color: accent, border:`1px solid ${accent}44`,
          borderRadius:20, padding:'3px 10px', fontSize:11, fontWeight:700,
          fontFamily:'DM Sans', letterSpacing:'0.06em',
        }}>{rec.badge}</span>
      </div>
      {/* Title */}
      <h4 style={{
        fontFamily:'Syne', fontWeight:800, fontSize:16, color:'rgba(255,255,255,0.92)',
        marginBottom:12, letterSpacing:'-0.3px', lineHeight:1.3,
      }}>{rec.title}</h4>
      {/* Problema */}
      <div style={{ marginBottom:12 }}>
        <span style={{ fontFamily:'DM Sans', fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.3)', letterSpacing:'0.08em', textTransform:'uppercase' }}>Problema</span>
        <p style={{ fontFamily:'DM Sans', fontSize:13, color:'rgba(255,255,255,0.5)', lineHeight:1.6, marginTop:4 }}>{rec.problem}</p>
      </div>
      {/* Acción */}
      <div style={{ marginBottom:16 }}>
        <span style={{ fontFamily:'DM Sans', fontSize:11, fontWeight:700, color: accent, letterSpacing:'0.08em', textTransform:'uppercase' }}>Acción</span>
        <p style={{ fontFamily:'DM Sans', fontSize:13, color:'rgba(255,255,255,0.65)', lineHeight:1.6, marginTop:4 }}>{rec.action}</p>
      </div>
      {/* Footer */}
      <div style={{ display:'flex', gap:12, flexWrap:'wrap', borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:14 }}>
        <div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', fontFamily:'DM Sans', marginBottom:2 }}>IMPACTO ESTIMADO</div>
          <div style={{ fontSize:13, fontWeight:600, fontFamily:'DM Sans', color: accent }}>{rec.impact}</div>
        </div>
        <div style={{ marginLeft:'auto', textAlign:'right' }}>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', fontFamily:'DM Sans', marginBottom:2 }}>ESFUERZO</div>
          <div style={{ fontSize:13, fontWeight:600, fontFamily:'DM Sans', color:'rgba(255,255,255,0.55)' }}>{rec.effort}</div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
function ReporteEDA() {
  const [started, setStarted] = useState(false);
  const [activeTab, setActiveTab] = useState('performance');
  const sectionRef = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setStarted(true); },
      { threshold: 0.15 }
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  // ── Data (real) ──
  const metrics = [
    { label:'LCP',  value:'1.4s',  status:'good',               barPct: 88 },
    { label:'FCP',  value:'1.2s',  status:'good',               barPct: 92 },
    { label:'INP',  value:'62ms',  status:'good',               barPct: 94 },
    { label:'TTFB', value:'439ms', status:'needs_improvement',  barPct: 56 },
    { label:'CLS',  value:'0.33',  status:'poor',               barPct: 22 },
  ];

  const checks = [
    { ok:true,  label:'HTTPS activo' },
    { ok:false, label:'Sin meta description' },
    { ok:false, label:'Sin etiqueta H1' },
    { ok:false, label:'Sin sitemap.xml' },
    { ok:false, label:'Sin robots.txt' },
    { ok:true,  label:'Dominio con autoridad (DA alta)' },
  ];

  const recs = [
    {
      badge:'QUICK WIN · ALTO IMPACTO',
      title:'Agrega meta description a todas las páginas',
      problem:'El 100% de tus páginas carecen de meta description. Google genera snippets automáticos que reducen el CTR orgánico de forma significativa.',
      action:'Escribe una meta description única de 150–160 caracteres por página principal con tu keyword objetivo y una llamada a la acción clara.',
      impact:'+15–30% CTR en búsquedas',
      effort:'2–4 horas',
      accent:'#5DB848',
    },
    {
      badge:'QUICK WIN · ALTO IMPACTO',
      title:'Implementa etiquetas H1 en cada página',
      problem:'Sin H1 visible, los motores de búsqueda no pueden determinar el tema principal de cada página y penalizan tu relevancia semántica.',
      action:'Agrega un H1 único y descriptivo por página que incluya la keyword principal. Solo debe haber un H1 por URL.',
      impact:'+20% relevancia semántica',
      effort:'1–2 horas',
      accent:'#A3C94A',
    },
    {
      badge:'ESTRATÉGICO · CRÍTICO',
      title:'Corrige el Cumulative Layout Shift (CLS: 0.33)',
      problem:'Tu CLS está en zona POBRE (umbral: 0.1). Elementos visuales saltan mientras carga la página, lo que aumenta el rebote en móvil y afecta el ranking.',
      action:'Reserva dimensiones explícitas para imágenes, embeds y anuncios. Evita insertar contenido sobre texto existente durante la carga.',
      impact:'Mejora directa Core Web Vitals',
      effort:'1–2 días dev',
      accent:'#F5C842',
    },
  ];

  // ── Layout tokens ──
  const bg   = '#0D0F0C';
  const bg2  = '#131508';
  const bg3  = '#1A1D10';
  const bdr  = 'rgba(255,255,255,0.07)';
  const txt  = 'rgba(255,255,255,0.88)';
  const muted= 'rgba(255,255,255,0.45)';

  return (
    <section ref={sectionRef} style={{ background: bg, padding:'96px 24px', fontFamily:'DM Sans, sans-serif' }}>
      <style>{STYLES}</style>

      <div style={{ maxWidth:1100, margin:'0 auto' }}>

        {/* ── Section Header ── */}
        <div className="eda-fade-up" style={{ marginBottom:56, textAlign:'center' }}>
          <div style={{
            display:'inline-flex', alignItems:'center', gap:6,
            background:bg2, border:'1px solid rgba(93,184,72,0.3)',
            borderRadius:20, padding:'5px 14px', marginBottom:20,
          }}>
            <span className="eda-blink" style={{ width:7, height:7, borderRadius:'50%', background:'#5DB848', display:'inline-block' }} />
            <span style={{ color:'#5DB848', fontSize:11, fontWeight:700, letterSpacing:'0.1em' }}>DEMO INTERACTIVO</span>
          </div>
          <h2 style={{
            fontFamily:'Syne', fontWeight:800, fontSize:'clamp(32px,4.5vw,56px)',
            letterSpacing:'-2px', color:txt, lineHeight:1.05, marginBottom:14,
          }}>Tu diagnóstico digital</h2>
          <p style={{ color:muted, fontSize:16, maxWidth:480, margin:'0 auto' }}>
            Análisis real de <strong style={{ color:'rgba(255,255,255,0.65)' }}>dian.gov.co</strong> — así se ve tu reporte
          </p>
        </div>

        {/* ── Row 1: Score Ring + AI Summary ── */}
        <div style={{
          display:'grid',
          gridTemplateColumns:'clamp(240px, 30%, 300px) 1fr',
          gap:20, marginBottom:20, alignItems:'stretch',
        }}>
          {/* Score Ring Card */}
          <div style={{
            background:bg2, border:`1px solid ${bdr}`,
            borderRadius:16, padding:'32px 24px',
            display:'flex', flexDirection:'column', alignItems:'center', gap:24,
          }}>
            <div style={{ color:muted, fontSize:12, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase' }}>Puntuación EDA</div>
            <ScoreRing score={80} started={started} />
            {/* Badges */}
            <div style={{ display:'flex', flexDirection:'column', gap:8, width:'100%' }}>
              {[
                { label:'PERFORMANCE', color:'#5DB848', icon:'✓' },
                { label:'SEO',         color:'#F5C842', icon:'⚠' },
                { label:'PRESENCIA',   color:'rgba(255,255,255,0.25)', icon:'—' },
              ].map(b => (
                <div key={b.label} style={{
                  display:'flex', alignItems:'center', justifyContent:'space-between',
                  background:bg3, borderRadius:8, padding:'8px 12px',
                  border:`1px solid rgba(255,255,255,0.04)`,
                }}>
                  <span style={{ fontFamily:'DM Sans', fontSize:12, fontWeight:700, color:b.color, letterSpacing:'0.07em' }}>{b.label}</span>
                  <span style={{ color:b.color, fontSize:14, fontWeight:700 }}>{b.icon}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Summary Card */}
          <div style={{
            background:bg2,
            borderLeft:`4px solid #5DB848`,
            borderTop:`1px solid ${bdr}`, borderRight:`1px solid ${bdr}`, borderBottom:`1px solid ${bdr}`,
            borderRadius:'0 16px 16px 0',
            padding:'28px 32px',
            display:'flex', flexDirection:'column', gap:16,
          }}>
            {/* Header */}
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div style={{
                background:'rgba(93,184,72,0.15)', border:'1px solid rgba(93,184,72,0.3)',
                borderRadius:8, padding:'6px 10px',
                fontFamily:'Syne', fontWeight:800, fontSize:14, color:'#5DB848',
                display:'flex', alignItems:'center', gap:6,
              }}>
                <span className="eda-blink" style={{ width:6, height:6, borderRadius:'50%', background:'#5DB848', display:'inline-block' }} />
                AI
              </div>
              <div>
                <div style={{ fontFamily:'Syne', fontWeight:800, fontSize:17, color:txt }}>Análisis de Claude AI</div>
                <div style={{ fontSize:11, color:muted }}>claude-sonnet-4-6 · 2.5k tokens</div>
              </div>
            </div>

            {/* Body */}
            <p style={{
              fontFamily:'DM Sans', fontSize:14, color:'rgba(255,255,255,0.65)',
              lineHeight:1.75, flexGrow:1,
              borderLeft:'1px solid rgba(255,255,255,0.08)', paddingLeft:16,
            }}>
              Tu sitio tiene una base técnica sólida — velocidad de carga en el{' '}
              <span style={{ color:'#5DB848', fontWeight:600 }}>top 20% para Colombia</span>.
              Sin embargo, estás dejando dinero sobre la mesa: sin meta description, sin H1,
              y un CLS crítico que afecta la experiencia móvil. Con{' '}
              <span style={{ color:'#A3C94A', fontWeight:600 }}>44,868 keywords posicionadas</span>{' '}
              y tráfico estimado de{' '}
              <span style={{ color:'#A3C94A', fontWeight:600 }}>$6.1M USD</span>,
              una optimización SEO básica podría triplicar tu visibilidad en 60 días.
            </p>

            {/* Impact chip */}
            <div style={{ display:'inline-flex', gap:8, alignItems:'center' }}>
              <span style={{
                background:'rgba(93,184,72,0.12)', border:'1px solid rgba(93,184,72,0.3)',
                color:'#5DB848', borderRadius:20, padding:'5px 14px',
                fontSize:12, fontWeight:700, fontFamily:'DM Sans', letterSpacing:'0.06em',
              }}>POTENCIAL ALTO</span>
              <span style={{ color:muted, fontSize:12 }}>·</span>
              <span style={{
                background:'rgba(245,200,66,0.1)', border:'1px solid rgba(245,200,66,0.3)',
                color:'#F5C842', borderRadius:20, padding:'5px 14px',
                fontSize:12, fontWeight:700, fontFamily:'DM Sans', letterSpacing:'0.06em',
              }}>Acción rápida</span>
            </div>
          </div>
        </div>

        {/* ── Row 2: Metric Cards ── */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>

          {/* Performance Card */}
          <div style={{
            background:bg2, border:`1px solid ${bdr}`,
            borderRadius:16, padding:'24px 28px',
          }}>
            {/* Header */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ fontSize:20 }}>⚡</span>
                <span style={{ fontFamily:'Syne', fontWeight:800, fontSize:17, color:txt }}>Performance</span>
              </div>
              <div style={{
                background:'rgba(93,184,72,0.15)', color:'#5DB848',
                border:'1px solid rgba(93,184,72,0.3)',
                borderRadius:20, padding:'3px 12px',
                fontFamily:'DM Sans', fontSize:12, fontWeight:700,
              }}>80 / 100</div>
            </div>

            {/* Metrics */}
            <div>
              {metrics.map(m => (
                <MetricBar key={m.label} {...m} started={started} />
              ))}
            </div>

            {/* Footer */}
            <div style={{
              marginTop:14, paddingTop:12, borderTop:`1px solid ${bdr}`,
              display:'flex', alignItems:'center', gap:6,
            }}>
              <span style={{ fontSize:10, color:muted }}>●</span>
              <span style={{ fontFamily:'DM Sans', fontSize:11, color:muted }}>
                Datos reales de Chrome UX Report (CrUX) · Mar–Abr 2026
              </span>
            </div>
          </div>

          {/* SEO Card */}
          <div style={{
            background:bg2, border:`1px solid ${bdr}`,
            borderRadius:16, padding:'24px 28px',
          }}>
            {/* Header */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ fontSize:20 }}>🔍</span>
                <span style={{ fontFamily:'Syne', fontWeight:800, fontSize:17, color:txt }}>SEO &amp; Presencia</span>
              </div>
              <div style={{
                background:'rgba(245,200,66,0.12)', color:'#F5C842',
                border:'1px solid rgba(245,200,66,0.3)',
                borderRadius:20, padding:'3px 12px',
                fontFamily:'DM Sans', fontSize:12, fontWeight:700,
              }}>50 / 100</div>
            </div>

            {/* Checks */}
            <div style={{ marginBottom:18 }}>
              {checks.map((c, i) => <CheckRow key={i} {...c} />)}
            </div>

            {/* Divider */}
            <div style={{ height:1, background:bdr, margin:'0 0 18px' }} />

            {/* Domain stats 2x2 */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              {[
                { val:'44,868', lbl:'Keywords' },
                { val:'3,639',  lbl:'Posición #1' },
                { val:'$6.1M',  lbl:'Tráfico ETV' },
                { val:'Alto',   lbl:'Potencial' },
              ].map(s => (
                <div key={s.lbl} style={{ background:bg3, borderRadius:10, padding:'12px 14px' }}>
                  <div style={{ fontFamily:'Syne', fontWeight:800, fontSize:22, color:'rgba(255,255,255,0.88)', letterSpacing:'-0.5px' }}>{s.val}</div>
                  <div style={{ fontFamily:'DM Sans', fontSize:11, color:muted, marginTop:2 }}>{s.lbl}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Row 3: Recommendations ── */}
        <div style={{
          background:bg2, border:`1px solid ${bdr}`,
          borderRadius:16, padding:'32px 28px',
        }}>
          {/* Header */}
          <div style={{ marginBottom:28 }}>
            <h3 style={{
              fontFamily:'Syne', fontWeight:800, fontSize:22,
              letterSpacing:'-0.7px', color:txt, marginBottom:6,
            }}>Plan de acción priorizado</h3>
            <p style={{ color:muted, fontSize:13 }}>Ordenado por impacto · Generado por Claude AI</p>
          </div>

          {/* Cards grid */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:16 }}>
            {recs.map((r, i) => (
              <RecCard key={i} rec={r} accent={r.accent} delay={i * 100} />
            ))}
          </div>
        </div>

        {/* ── Footer CTA ── */}
        <div style={{ textAlign:'center', marginTop:48 }}>
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap', marginBottom:14 }}>
            <button className="eda-btn-primary eda-pulse">Auditar mi sitio →</button>
            <button className="eda-btn-outline">Ver reporte completo de demo</button>
          </div>
          <p style={{ color:muted, fontSize:13 }}>Resultado en &lt;30 segundos · Sin tarjeta de crédito</p>
        </div>

      </div>
    </section>
  );
}

Object.assign(window, { ReporteEDA });
