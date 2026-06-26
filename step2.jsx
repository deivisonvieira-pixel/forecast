// Step 2 — Expansão · Engage DS
const { useState: useS2, useEffect: useE2, useMemo: useM2 } = React;

function Step2({ data, setData, onBack, onSubmit }) {
  const update = (k, v) => setData((d) => ({ ...d, [k]: v }));

  const r = useM2(() => {
    const pot = n(data.baseClientes) * (n(data.percentualExpansao) / 100);
    const exp = Math.round(pot * (n(data.propensaoExpansao) / 100));
    const rec = exp * n(data.ticketMedioExpansao);
    return { exp, rec, recur: n(data.servicosRecorrentes), quedas: n(data.quedasPrevistas) };
  }, [data]);

  const valid = data.ticketMedioExpansao !== '';
  const [bumped, setBumped] = useS2(false);
  useE2(() => { setBumped(true); const t = setTimeout(() => setBumped(false), 300); return () => clearTimeout(t); }, [r.rec]);

  const maxVal = Math.max(r.rec + r.recur, 100);
  const segments = useM2(() =>
    Array.from({ length: 12 }, (_, i) => {
      const t = (i + 1) / 12;
      return { expand: r.rec * t, recur: r.recur * t };
    }),
    [r.rec, r.recur]
  );

  return (
    <div className="wizard">
      <div className="wizard-wrap">
        <Progress step={2} />
        <div className="wizard-grid">
          <div>
            <div className="wizard-title">
              <span className="kicker"><span className="dot"></span>Etapa 2 de 2 · Expansão</span>
              <h2>Agora, o potencial de <em>crescer</em> com quem já é cliente.</h2>
              <p className="sub">Seus clientes atuais podem comprar mais, fazer upgrade ou contratar novos serviços. Vamos quantificar esse potencial silencioso.</p>
            </div>

            <div className="form-stack">
              <SliderField label="% da base com potencial de expansão" badge="01"
                value={data.percentualExpansao} onChange={(v) => update('percentualExpansao', v)}
                hint="Quem pode comprar mais, fazer upgrade ou contratar novos serviços." />

              <SliderField label="% que deve expandir em 90 dias" badge="02"
                value={data.propensaoExpansao} onChange={(v) => update('propensaoExpansao', v)}
                hint="Seja conservador. Pense na capacidade real do seu time de CS/Vendas." />

              <NumberField label="Ticket médio de expansão" badge="03"
                value={data.ticketMedioExpansao} onChange={(v) => update('ticketMedioExpansao', v)}
                placeholder="500" prefix="R$" hint="Valor médio do upgrade, upsell ou cross-sell." step={0.01} />

              <NumberField label="Receita recorrente esperada em 90 dias" badge="04"
                value={data.servicosRecorrentes} onChange={(v) => update('servicosRecorrentes', v)}
                placeholder="10000" prefix="R$" hint="Pagamentos recorrentes já garantidos (pode ser zero)." step={0.01} />

              <NumberField label="Quedas previstas" badge="05"
                value={data.quedasPrevistas} onChange={(v) => update('quedasPrevistas', v)}
                placeholder="0" prefix="R$" hint="Clientes que devem sair ou reduzir contrato." step={0.01} />
            </div>

            <div className="wizard-nav">
              <button className="btn-link" onClick={onBack}>← Voltar</button>
              <button className="btn btn-purple" onClick={onSubmit} disabled={!valid}>
                Calcular meu Forecast <span className="arr">→</span>
              </button>
            </div>
          </div>

          {/* Preview panel */}
          <aside className="preview">
            <div className="preview-inner">
              <div className="preview-label">Projeção em tempo real <small>· 90 DIAS</small></div>
              <div className={`preview-big ${bumped ? 'bump' : ''}`}>
                R${Math.round(r.rec).toLocaleString('pt-BR')}
              </div>
              <div className="preview-sublabel">RECEITA POTENCIAL EM EXPANSÕES</div>

              <div className="preview-rows">
                <div className="preview-row">
                  <span className="lbl"><span className="arr">→</span> Expansões</span>
                  <span className="val">{fmtNum(r.exp)}</span>
                </div>
                <div className="preview-row">
                  <span className="lbl"><span className="arr">→</span> Receita de expansão</span>
                  <span className="val accent">{fmtBRL(r.rec)}</span>
                </div>
                <div className="preview-row">
                  <span className="lbl"><span className="arr">→</span> Recorrente confirmada</span>
                  <span className="val">{fmtBRL(r.recur)}</span>
                </div>
                <div className="preview-row">
                  <span className="lbl"><span className="arr" style={{color:'var(--danger)'}}>→</span> Perda prevista</span>
                  <span className="val danger">−{fmtBRL(r.quedas)}</span>
                </div>
              </div>

              <div className="preview-chart">
                <div className="preview-chart-head">
                  <span>RECEITA ACUMULADA · 90 DIAS</span>
                  <span>
                    <span style={{color:'var(--purple)'}}>● EXP</span>
                    <span style={{marginLeft:8,color:'var(--lilac)'}}>● REC</span>
                  </span>
                </div>
                <div className="bars-row">
                  {segments.map((s, i) => {
                    const expH = (s.expand / maxVal) * 100;
                    const recH = (s.recur / maxVal) * 100;
                    return (
                      <div className="bcol" key={i}>
                        <div className="bar-stack">
                          <div className="bar-seg expand" style={{ height: expH + '%' }}></div>
                          <div className="bar-seg recur first" style={{ height: recH + '%' }}></div>
                        </div>
                        <div className="lbl">D{(i + 1) * 7}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

window.Step2 = Step2;
