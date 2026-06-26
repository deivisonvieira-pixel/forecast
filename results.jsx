// Results scene — Engage DS
const { useState: useSR, useEffect: useER, useMemo: useMR } = React;

function useCountUp(target, duration = 1800, deps = []) {
  const [val, setVal] = useSR(0);
  useER(() => {
    let start = null, raf;
    const step = (t) => {
      if (start === null) start = t;
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(target * eased);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, deps);
  return val;
}

function Results({ data, onReset, onAgendar }) {
  const r = useMR(() => calc(data), [data]);
  const animTotal = useCountUp(r.total, 1800, [r.total]);
  const empresa = data.empresa || 'Sua Empresa';
  const nomePrimeiro = (data.nome || '').split(' ')[0] || '';

  const [aiState, setAiState] = useSR({ loading: false, text: '', error: '' });
  const [consent, setConsent] = useSR({ email: true, whatsapp: true });
  const [send, setSend] = useSR({ status: 'idle', result: null, error: '' });

  const handleGerarIA = async () => {
    setAiState({ loading: true, text: '', error: '' });
    setSend({ status: 'idle', result: null, error: '' });
    const res = await gerarDiagnosticoIA(data, r);
    if (res.ok) setAiState({ loading: false, text: res.text, error: '' });
    else setAiState({ loading: false, text: '', error: res.error });
  };

  const handleEnviarAnalise = async () => {
    if (!consent.email && !consent.whatsapp) {
      setSend({ status: 'error', result: null, error: 'Selecione ao menos um canal.' });
      return;
    }
    setSend({ status: 'sending', result: null, error: '' });
    try {
      const res = await window.enviarAnaliseIA(data, r, aiState.text, consent);
      setSend({ status: 'done', result: res, error: '' });
    } catch (e) {
      setSend({ status: 'error', result: null, error: 'Falha ao registrar. Tente novamente.' });
    }
  };

  // Live daily loss counter
  const [perdidoHoje, setPerdidoHoje] = useSR(0);
  useER(() => {
    const start = Date.now();
    const id = setInterval(() => {
      const sec = (Date.now() - start) / 1000;
      setPerdidoHoje((r.diario / 86400) * sec);
    }, 80);
    return () => clearInterval(id);
  }, [r.diario]);

  // Bar segments
  const segs = [
    { key: 'indic',  val: r.receitaIndicacoes, cls: 'indic' },
    { key: 'expand', val: r.receitaExpansoes,   cls: 'expand' },
    { key: 'recur',  val: r.recorrente,         cls: 'recur' },
  ];
  const positiveTotal = segs.reduce((s, x) => s + x.val, 0);
  const totalSplit = splitBRL(animTotal);

  const handleAgendar = () => { if (onAgendar) onAgendar(); else window.open('https://useengage.com.br/contato', '_blank'); };

  return (
    <>
      {/* ── HERO DARK ── */}
      <section className="results-hero">
        <div className="results-hero-inner">
          <div className="results-company-tag">
            <span className="dot"></span>
            {empresa.toUpperCase()} · DIAGNÓSTICO 90 DIAS
          </div>
          <h1>
            {nomePrimeiro ? `${nomePrimeiro}, seu ` : 'Seu '}
            potencial de receita <em>escondido</em>.
          </h1>
          <p className="sub">
            Análise personalizada baseada nos seus números. Esses são os <strong style={{color:'var(--cream)'}}>R$ que estão parados</strong> na sua base hoje.
          </p>

          <div className="hero-number-wrap">
            <div className="hero-number-card">
              <div className="lbl">
                <span style={{width:7,height:7,borderRadius:'50%',background:'var(--lilac)',display:'inline-block'}}></span>
                RECEITA TOTAL POTENCIAL · 90 DIAS
              </div>
              <div className="total-number">
                <span className="currency">R$</span>{totalSplit.main}<span style={{fontSize:'0.35em',opacity:0.5}}>,{totalSplit.cents}</span>
              </div>
              <p className="hero-number-msg">
                Esse é o dinheiro que está <em>escondido</em> na sua base hoje. Você está deixando isso na mesa <strong style={{color:'var(--cream)'}}>todos os trimestres</strong> — e cada dia sem ação é receita que não volta.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── URGENCY BANNER (light) ── */}
      <div className="urg-banner">
        <div className="urg-banner-inner">
          <div className="urg-left">
            <div className="lbl">
              <span style={{width:6,height:6,borderRadius:'50%',background:'var(--danger)',animation:'blink 1s infinite',display:'inline-block'}}></span>
              PERDIDO DESDE QUE ABRIU ESTA PÁGINA
            </div>
            <div className="val">
              −R${perdidoHoje.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="urg-right">
            A cada dia sem agir, sua empresa deixa <strong>{fmtBRL(r.diario)}</strong> na mesa.
            São <strong>{fmtBRL(r.diario * 30)}</strong> por mês de receita potencial não capturada.
          </div>
        </div>
      </div>

      {/* ── BODY (light) ── */}
      <div className="results-body">

        {/* Metric cards */}
        <section className="metrics-grid">
          <div className="metric-card">
            <div className="head"><span className="tag">01 / INDICAÇÕES</span><div className="icon">↗</div></div>
            <div className="val"><span className="currency">R$</span>{fmtNum(r.receitaIndicacoes)}</div>
            <div className="name">Receita por Indicações</div>
            <div className="detail">{fmtNum(r.conversoes)} novos clientes</div>
          </div>
          <div className="metric-card">
            <div className="head"><span className="tag">02 / EXPANSÕES</span><div className="icon">⤴</div></div>
            <div className="val"><span className="currency">R$</span>{fmtNum(r.receitaExpansoes)}</div>
            <div className="name">Receita por Expansões</div>
            <div className="detail">{fmtNum(r.expansoes)} expansões previstas</div>
          </div>
          <div className="metric-card">
            <div className="head"><span className="tag">03 / RECORRENTE</span><div className="icon">↻</div></div>
            <div className="val"><span className="currency">R$</span>{fmtNum(r.recorrente)}</div>
            <div className="name">Receita Recorrente</div>
            <div className="detail">Já garantida nos próximos 90 dias</div>
          </div>
          <div className="metric-card danger">
            <div className="head"><span className="tag">04 / RISCO</span><div className="icon">↘</div></div>
            <div className="val"><span className="currency">R$</span>{fmtNum(r.quedas)}</div>
            <div className="name">Quedas Previstas</div>
            <div className="detail">Precisa atenção urgente</div>
          </div>
        </section>

        {/* Breakdown */}
        <section className="breakdown-card">
          <div className="breakdown-head">
            <div>
              <h3>Composição da receita potencial</h3>
              <div style={{fontSize:13,color:'var(--ink-mute)'}}>Quebra por canal · próximos 90 dias</div>
            </div>
            <div className="legend">
              <div className="legend-item"><span className="swatch" style={{background:'var(--purple)'}}></span> Indicações</div>
              <div className="legend-item"><span className="swatch" style={{background:'var(--lilac)'}}></span> Expansões</div>
              <div className="legend-item"><span className="swatch" style={{background:'rgba(110,44,184,0.35)'}}></span> Recorrente</div>
              <div className="legend-item"><span className="swatch" style={{background:'var(--danger)'}}></span> Quedas</div>
            </div>
          </div>
          <div className="bar-chart-horiz">
            {segs.map(s => s.val > 0 && (
              <div key={s.key} className={`seg ${s.cls}`} style={{flex: s.val}}>
                {((s.val / Math.max(positiveTotal, 1)) * 100) > 8 ? fmtBRL(s.val) : ''}
              </div>
            ))}
          </div>
          {r.quedas > 0 && (
            <div style={{marginTop:8}}>
              <div style={{
                display:'inline-flex', alignItems:'center', gap:8,
                background:'var(--danger-soft)', border:'1px dashed rgba(217,53,53,0.35)',
                color:'var(--danger)', padding:'8px 14px', borderRadius:8, fontSize:12, fontWeight:600
              }}>
                ↘ −{fmtBRL(r.quedas)} de perda prevista
              </div>
            </div>
          )}
          <div className="bar-total-row">
            <span className="total-lbl">Receita Total Líquida (90 dias)</span>
            <span className="total-val">
              R${Math.round(r.total).toLocaleString('pt-BR')}
            </span>
          </div>
        </section>

        {/* Interpretation */}
        <section className="interpretation">
          Em 90 dias, sua base de <strong>{fmtNum(n(data.baseClientes))} clientes</strong> pode gerar aproximadamente <strong>{fmtBRL(r.receitaIndicacoes)}</strong> em indicações, <strong>{fmtBRL(r.receitaExpansoes)}</strong> em expansões e <strong>{fmtBRL(r.recorrente)}</strong> em receita recorrente, com quedas previstas de <span className="bad">{fmtBRL(r.quedas)}</span>. Isso resulta em uma <strong>receita total estimada de {fmtBRL(r.total)}</strong> no período.
        </section>

        {/* AI Analysis card */}
        <section className="ai-card">
          <div className="ai-head">
            <div className="icon">✦</div>
            <div>
              <h4>Análise estratégica personalizada com IA</h4>
              <p>Diagnóstico aprofundado dos seus números pelos consultores Engage assistidos por IA — recomendações específicas para capturar essa receita.</p>
            </div>
          </div>

          {!aiState.loading && !aiState.text && (
            <button className="btn btn-purple" onClick={handleGerarIA}>
              ✦ Gerar minha análise com IA <span className="arr">→</span>
            </button>
          )}
          {aiState.loading && (
            <div className="ai-loading">
              <div className="ai-spinner"></div>
              <span>Analisando seu cenário…</span>
            </div>
          )}
          {aiState.error && (
            <div className="sched-err" style={{marginTop:16}}>
              Não conseguimos gerar agora.
              <button className="btn-link" onClick={handleGerarIA} style={{marginLeft:12}}>Tentar de novo</button>
            </div>
          )}
          {aiState.text && (
            <>
              <div className="ai-result" dangerouslySetInnerHTML={{__html: renderMarkdown(aiState.text)}} />

              {/* Consent block — dispara 2º e-mail para Engage */}
              <div className="consent-block">
                <div className="consent-head">
                  <div className="consent-icon">✦</div>
                  <div>
                    <h4>Quer receber esta análise + materiais?</h4>
                    <p>Nosso time entra em contato em até 1h útil com a análise completa e o próximo passo para capturar esta receita. Escolha como prefere receber:</p>
                  </div>
                </div>

                <div className="consent-options">
                  <label className={`consent-opt ${consent.email ? 'on' : ''}`}>
                    <input type="checkbox" checked={consent.email} onChange={(e) => setConsent(c => ({ ...c, email: e.target.checked }))} />
                    <div className="consent-opt-body">
                      <div className="consent-opt-title">
                        <span className="check-box">{consent.email ? '✓' : ''}</span>
                        Por e-mail
                      </div>
                      <div className="consent-opt-meta">{data.email}</div>
                    </div>
                  </label>
                  <label className={`consent-opt ${consent.whatsapp ? 'on' : ''}`}>
                    <input type="checkbox" checked={consent.whatsapp} onChange={(e) => setConsent(c => ({ ...c, whatsapp: e.target.checked }))} />
                    <div className="consent-opt-body">
                      <div className="consent-opt-title">
                        <span className="check-box">{consent.whatsapp ? '✓' : ''}</span>
                        Por WhatsApp
                      </div>
                      <div className="consent-opt-meta">{data.telefone}</div>
                    </div>
                  </label>
                </div>

                {send.status === 'idle' && (
                  <button className="btn btn-purple" onClick={handleEnviarAnalise} disabled={!consent.email && !consent.whatsapp}>
                    Sim, quero receber a análise <span className="arr">→</span>
                  </button>
                )}
                {send.status === 'sending' && (
                  <div className="ai-loading"><div className="ai-spinner"></div><span>Registrando seu interesse…</span></div>
                )}
                {send.status === 'done' && (
                  <div className="consent-success">
                    <div className="consent-success-mark">✓</div>
                    <div>
                      <strong>Pronto! Nosso time já recebeu o aviso.</strong>
                      <div className="consent-success-meta">
                        {consent.email && <span>📧 Entraremos em contato via {data.email}</span>}
                        {consent.whatsapp && <span>💬 Também via WhatsApp: {data.telefone}</span>}
                        <span>Tempo de resposta: até 1h útil.</span>
                      </div>
                    </div>
                  </div>
                )}
                {send.status === 'error' && (
                  <div className="sched-err">
                    {send.error}
                    <button className="btn-link" onClick={handleEnviarAnalise} style={{marginLeft:12}}>Tentar novamente</button>
                  </div>
                )}
                <div className="consent-fineprint">
                  Ao confirmar, você autoriza a Engage a entrar em contato. Seus dados são usados apenas para este diagnóstico — sem spam, sem repasse a terceiros.
                </div>
              </div>
            </>
          )}
        </section>
      </div>

      {/* ── CTA FINAL (dark) ── */}
      <section className="cta-final">
        <div className="cta-final-inner">
          <span className="kicker on-dark"><span className="dot"></span>Próximo passo</span>
          <h3>Como transformar <em>{fmtBRL(r.total)}</em> em receita real?</h3>
          <p>
            Nossa metodologia <strong>Engage</strong> implementa estratégia, tecnologia e processos para sua empresa capturar essa receita escondida em <strong>90 dias</strong>.
            Em uma call de 30 minutos, mostramos o caminho exato para sua base virar motor de crescimento previsível.
          </p>
          <div className="cta-actions">
            <button className="btn btn-cream" onClick={handleAgendar}>
              Agendar diagnóstico gratuito <span className="arr">→</span>
            </button>
            <button className="btn btn-ghost-dk" onClick={handleAgendar} style={{fontSize:14}}>
              Falar com especialista
            </button>
          </div>
          <div className="meta">
            <span>★★★★★</span>
            <span>+200 empresas transformaram bases em motores de receita</span>
          </div>
        </div>
      </section>

      <div className="results-bottom">
        <button className="btn-link" onClick={onReset}>← Fazer nova calculação</button>
      </div>
    </>
  );
}

window.Results = Results;
