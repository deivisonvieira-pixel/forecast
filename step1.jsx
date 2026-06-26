// Step 1 — Indicações · Engage DS
const { useState: useS1, useEffect: useE1, useMemo: useM1 } = React;

function Step1({ data, setData, onBack, onNext }) {
  const update = (k, v) => setData((d) => ({ ...d, [k]: v }));

  const r = useM1(() => {
    const elegivel = n(data.baseClientes) * (n(data.percentualElegivel) / 100);
    const indic = elegivel * n(data.taxaIndicacao);
    const conv = Math.round(indic * (n(data.conversaoIndicados) / 100));
    const rec = conv * n(data.ticketMedioIndicacao);
    return { indic: Math.round(indic), conv, rec };
  }, [data]);

  const valid = n(data.baseClientes) > 0 && n(data.taxaIndicacao) > 0 && n(data.ticketMedioIndicacao) > 0;
  const [bumped, setBumped] = useS1(false);
  useE1(() => { setBumped(true); const t = setTimeout(() => setBumped(false), 300); return () => clearTimeout(t); }, [r.rec]);

  const maxVal = Math.max(r.rec, 100);
  const barHeights = useM1(() =>
    Array.from({ length: 12 }, (_, i) => {
      const t = (i + 1) / 12;
      return Math.min(100, (r.rec * t / maxVal) * 100 * (0.6 + 0.4 * Math.sin(i)));
    }),
    [r.rec]
  );

  return (
    <div className="wizard">
      <div className="wizard-wrap">
        <Progress step={1} />
        <div className="wizard-grid">
          <div>
            <div className="wizard-title">
              <span className="kicker"><span className="dot"></span>Etapa 1 de 2 · Indicações</span>
              <h2>Vamos falar da sua <em>base</em> de clientes.</h2>
              <p className="sub">Você já tem clientes. Eles podem indicar outros — esse é o canal mais barato e eficiente que existe. Vamos calcular quanto isso vale.</p>
            </div>

            <div className="form-stack">
              <NumberField label="Base de clientes ativos" badge="01" value={data.baseClientes}
                onChange={(v) => update('baseClientes', v)} placeholder="Ex: 500"
                hint="Clientes pagando ou ativos neste momento." min={1} />

              <SliderField label="% da base que pode indicar" badge="02"
                value={data.percentualElegivel} onChange={(v) => update('percentualElegivel', v)}
                hint="Pense nos clientes satisfeitos e engajados. Média do mercado: 15–30%." />

              <NumberField label="Indicações por cliente em 90 dias" badge="03"
                value={data.taxaIndicacao} onChange={(v) => update('taxaIndicacao', v)}
                placeholder="Ex: 2" hint="Média brasileira: 1 a 3 indicações." step={0.1} />

              <SliderField label="% de conversão de indicados" badge="04"
                value={data.conversaoIndicados} onChange={(v) => update('conversaoIndicados', v)}
                hint="Indicações costumam converter entre 20–30% (vs. 1–3% de tráfego pago)." />

              <NumberField label="Ticket médio de indicação" badge="05"
                value={data.ticketMedioIndicacao} onChange={(v) => update('ticketMedioIndicacao', v)}
                placeholder="500" prefix="R$" hint="Valor que você cobra (recorrente ou não)." step={0.01} />
            </div>

            <div className="wizard-nav">
              <button className="btn-link" onClick={onBack}>← Voltar</button>
              <button className="btn btn-purple" onClick={onNext} disabled={!valid}>
                Próximo: Expansão <span className="arr">→</span>
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
              <div className="preview-sublabel">RECEITA POTENCIAL EM INDICAÇÕES</div>

              <div className="preview-rows">
                <div className="preview-row">
                  <span className="lbl"><span className="arr">→</span> Indicações qualificadas</span>
                  <span className="val">{fmtNum(r.indic)}</span>
                </div>
                <div className="preview-row">
                  <span className="lbl"><span className="arr">→</span> Novos clientes fechados</span>
                  <span className="val">{fmtNum(r.conv)}</span>
                </div>
                <div className="preview-row">
                  <span className="lbl"><span className="arr">→</span> Receita potencial</span>
                  <span className="val accent">{fmtBRL(r.rec)}</span>
                </div>
              </div>

              <div className="preview-chart">
                <div className="preview-chart-head">
                  <span>RECEITA ACUMULADA · 90 DIAS</span>
                  <span style={{color:'var(--purple)'}}>● INDICAÇÕES</span>
                </div>
                <div className="bars-row">
                  {barHeights.map((h, i) => (
                    <div className="bcol" key={i}>
                      <div className="bar-stack">
                        <div className="bar-seg first" style={{ height: h + '%' }}></div>
                      </div>
                      <div className="lbl">D{(i + 1) * 7}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

window.Step1 = Step1;
