// Schedule scene — Engage DS
const { useState: useSS, useEffect: useES, useMemo: useMS } = React;

const MES_NOMES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const DIA_SEMANA = ['D','S','T','Q','Q','S','S'];
const HORARIOS = ['09:00','10:00','11:00','14:00','15:00','16:00','17:00'];

function pad(n) { return String(n).padStart(2, '0'); }
function fmtDateBR(d) { return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`; }
function dateKey(d) { return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }

function buildMonth(year, month) {
  const first = new Date(year, month, 1);
  const startWday = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startWday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function Schedule({ data, setData, calculo, onBack, onConfirmed }) {
  const today = new Date(); today.setHours(0,0,0,0);
  const [view, setView] = useSS({ y: today.getFullYear(), m: today.getMonth() });
  const [selected, setSelected] = useSS(data.dataAgenda || '');
  const [hour, setHour] = useSS(data.horaAgenda || '');
  const [obs, setObs] = useSS(data.observacoes || '');
  const [sending, setSending] = useSS(false);
  const [done, setDone] = useSS(false);
  const [err, setErr] = useSS('');

  const cells = useMS(() => buildMonth(view.y, view.m), [view]);
  const isDisabled = (d) => !d || d < today || d.getDay() === 0 || d.getDay() === 6;

  const goPrev = () => { const m = view.m - 1; if (m < 0) setView({ y: view.y-1, m: 11 }); else setView({ y: view.y, m }); };
  const goNext = () => { const m = view.m + 1; if (m > 11) setView({ y: view.y+1, m: 0 }); else setView({ y: view.y, m }); };

  const handleConfirm = async () => {
    if (!selected || !hour || sending) return;
    setSending(true); setErr('');
    const updated = { ...data, dataAgenda: selected, horaAgenda: hour, observacoes: obs };
    setData(updated); saveData(updated);
    const result = await enviarAgenda(updated, calculo);
    setSending(false);
    if (result.ok || result.simulated) {
      setDone(true);
      setTimeout(() => onConfirmed && onConfirmed(), 200);
    } else {
      setErr('Não conseguimos confirmar agora. Tente novamente em instantes.');
    }
  };

  if (done) {
    return (
      <div className="schedule-scene">
        <div className="schedule-hero">
          <div className="schedule-hero-inner">
            <span className="kicker on-dark"><span className="dot"></span>Agendamento confirmado</span>
          </div>
        </div>
        <div className="schedule-success">
          <div className="schedule-success-inner">
            <div className="success-icon">✓</div>
            <h1>Pronto, {(data.nome || '').split(' ')[0] || 'tudo certo'}!</h1>
            <p className="lead">
              Seu diagnóstico está marcado para <strong>{fmtDateBR(new Date(selected + 'T12:00'))}</strong> às <strong>{hour}</strong>.<br/>
              Você recebe o convite em <strong>{data.email}</strong> e uma confirmação no WhatsApp.
            </p>
            <div className="success-cards">
              <div className="success-card">
                <div className="ic">📧</div>
                <h4>Convite no e-mail</h4>
                <p>Com o link da call e os números do seu diagnóstico.</p>
              </div>
              <div className="success-card">
                <div className="ic">💬</div>
                <h4>Confirmação no WhatsApp</h4>
                <p>Nosso time entra em contato em até 1h útil.</p>
              </div>
              <div className="success-card">
                <div className="ic">📊</div>
                <h4>Pré-leitura</h4>
                <p>Vamos estudar seu cenário antes da call.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="schedule-scene">
      {/* Hero dark */}
      <div className="schedule-hero">
        <div className="schedule-hero-inner">
          <span className="kicker on-dark"><span className="dot"></span>Agendamento · 30 min com a Engage</span>
          <h1>Vamos transformar <em>{fmtBRL(calculo.total)}</em> em receita real.</h1>
          <p className="lead">Escolha o melhor horário para sua call de diagnóstico aprofundado. Mostramos o caminho exato para capturar essa receita em 90 dias.</p>
        </div>
      </div>

      {/* Body light */}
      <div className="schedule-body">
        <div className="schedule-grid">
          {/* Calendar */}
          <section className="sched-card">
            <div className="sched-card-head">
              <div>
                <h3>1. Escolha a data</h3>
                <small>Disponível em dias úteis</small>
              </div>
              <div className="cal-nav">
                <button onClick={goPrev} aria-label="Mês anterior">‹</button>
                <span>{MES_NOMES[view.m]} {view.y}</span>
                <button onClick={goNext} aria-label="Próximo mês">›</button>
              </div>
            </div>

            <div className="cal-head-row">
              {DIA_SEMANA.map((d, i) => <span key={i}>{d}</span>)}
            </div>
            <div className="cal-grid">
              {cells.map((d, i) => {
                if (!d) return <span key={i} className="cal-cell empty"></span>;
                const k = dateKey(d);
                const dis = isDisabled(d);
                return (
                  <button key={i} className={`cal-cell ${dis?'disabled':''} ${selected===k?'selected':''}`}
                    disabled={dis} onClick={() => !dis && setSelected(k)}>
                    {d.getDate()}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Hours + summary */}
          <section className="sched-card">
            <div className="sched-card-head">
              <div>
                <h3>2. Escolha o horário</h3>
                <small>{selected ? fmtDateBR(new Date(selected+'T12:00')) : 'Selecione uma data'} · BRT (UTC−3)</small>
              </div>
            </div>

            <div className="hour-grid">
              {HORARIOS.map(h => (
                <button key={h} className={`hour-cell ${hour===h?'selected':''}`}
                  disabled={!selected} onClick={() => setHour(h)}>
                  {h}
                </button>
              ))}
            </div>

            <div className="field" style={{marginTop:28}}>
              <label><span>Observações (opcional)</span></label>
              <input type="text" value={obs} onChange={(e) => setObs(e.target.value)}
                placeholder="Algo específico que queira discutir?" />
            </div>

            <div className="sched-summary">
              <div className="sched-summary-row"><span>Lead</span><strong>{data.nome}</strong></div>
              <div className="sched-summary-row"><span>Empresa</span><strong>{data.empresa}</strong></div>
              <div className="sched-summary-row"><span>Contato</span><strong>{data.email}</strong></div>
              <div className="sched-summary-row"><span>Quando</span><strong>{selected ? fmtDateBR(new Date(selected+'T12:00')) : '—'} · {hour || '—'}</strong></div>
              <div className="sched-summary-row total">
                <span>Receita potencial</span>
                <strong className="accent">{fmtBRL(calculo.total)}</strong>
              </div>
            </div>

            {err && <div className="sched-err">{err}</div>}

            <div className="sched-actions">
              <button className="btn-link" onClick={onBack}>← Voltar</button>
              <button className="btn btn-purple" onClick={handleConfirm} disabled={!selected || !hour || sending}>
                {sending ? 'Confirmando…' : 'Confirmar agendamento'} <span className="arr">→</span>
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

window.Schedule = Schedule;
