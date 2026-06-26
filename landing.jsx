// Landing scene — Engage Design System
const { useState: useStateL, useEffect: useEffectL, useMemo: useMemoL } = React;

function Landing({ onStart }) {
  const [counter, setCounter] = useStateL(2847593);
  const heroBars = [42, 65, 38, 78, 56, 88, 72, 95, 68, 82, 90, 76];

  useEffectL(() => {
    const id = setInterval(() => {
      setCounter((c) => c + Math.round(Math.random() * 47) + 12);
    }, 1500);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      {/* ── HERO (dark) ── */}
      <section className="landing-hero">
        <div className="hero-inner">
          <div className="hero-left">
            <span className="kicker on-dark">
              <span className="dot"></span>
              Diagnóstico de Receita · 3 minutos
            </span>
            <h1>
              Quanto você está deixando na <em>mesa</em>?
            </h1>
            <p className="lead">
              A maioria das empresas B2B deixa <strong style={{color:'var(--cream)'}}>30% a 50%</strong> da receita potencial parada na própria base de clientes. Vamos calcular o seu número real — em 90 dias, sem suposições.
            </p>
            <div className="hero-ctas">
              <button className="btn btn-cream" onClick={onStart}>
                Calcular meu potencial escondido <span className="arr">→</span>
              </button>
              <span style={{fontSize:13,color:'var(--cream-mute)'}}>~3 min · gratuito</span>
            </div>
            <div className="hero-meta">
              <div className="hero-avatars">
                <span>CM</span><span>AF</span><span>RS</span>
              </div>
              <span>+200 empresas já descobriram seu potencial</span>
            </div>
          </div>

          {/* Evidence card */}
          <div className="evidence">
            <div className="ev-head">
              <span>Receita perdida · B2B Brasil</span>
              <span className="stamp">
                <span style={{width:6,height:6,borderRadius:'50%',background:'var(--danger)',animation:'blink 1s infinite',display:'inline-block'}}></span>
                AO VIVO
              </span>
            </div>
            <div className="ev-figure">
              <div className="big">
                R${counter.toLocaleString('pt-BR')}
              </div>
              <div className="cap">
                Estimativa em tempo real desde que você abriu esta página, com base em 200+ empresas analisadas.
              </div>
            </div>
            <div className="ev-table">
              <div className="ev-row">
                <span className="lab">Receita parada em indicações</span>
                <span className="val pos">~R$ 500K</span>
              </div>
              <div className="ev-row">
                <span className="lab">ROI médio vs. aquisição nova</span>
                <span className="val pos">3–5×</span>
              </div>
              <div className="ev-row">
                <span className="lab">Primeiros resultados em</span>
                <span className="val">90 dias</span>
              </div>
            </div>
            <div className="ev-bars">
              {heroBars.map((h, i) => (
                <div key={i} className="bar" style={{ height: h + '%', animationDelay: (i * 0.05) + 's' }}></div>
              ))}
            </div>
            <div className="ev-foot">
              <span className="live-dot"></span>
              Atualizado em tempo real com base na página aberta
            </div>
          </div>
        </div>
      </section>

      {/* ── INSIGHTS (light) ── */}
      <section className="landing-insights">
        <div className="landing-insights-inner">
          <div className="sec-head">
            <div>
              <h2>Por que isso <em>importa</em> agora?</h2>
            </div>
            <div>
              <p className="lead">
                Tráfego pago fica mais caro a cada ano. Sua base de clientes é o ativo de crescimento mais barato e previsível que você já tem — só falta explorar com método.
              </p>
            </div>
          </div>

          <div className="stats">
            <div className="stat">
              <div className="n">R$500K</div>
              <div className="t">em média de receita escondida em <strong>indicações não exploradas</strong> por base de 500 clientes.</div>
              <div className="s hot">01 / INDICAÇÕES</div>
            </div>
            <div className="stat">
              <div className="n">3–5×</div>
              <div className="t">ROI ao investir na <strong>base existente</strong> versus aquisição de novos clientes via tráfego pago.</div>
              <div className="s">02 / RETORNO</div>
            </div>
            <div className="stat">
              <div className="n">90d</div>
              <div className="t">para ver os <strong>primeiros resultados concretos</strong> na sua operação, com método estruturado.</div>
              <div className="s">03 / TEMPO</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA strip ── */}
      <div className="landing-cta-strip">
        <div className="inner">
          <p>Em 3 minutos você descobre exatamente quanto sua empresa está deixando na mesa — e o caminho para capturar essa receita em 90 dias.</p>
          <button className="btn btn-purple" onClick={onStart}>
            Descobrir meu potencial escondido <span className="arr">→</span>
          </button>
        </div>
      </div>
    </>
  );
}

window.Landing = Landing;
