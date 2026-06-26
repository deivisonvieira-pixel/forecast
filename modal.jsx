// Modal — Engage DS · telefone obrigatório · e-mail corporativo
const { useState: useSM, useEffect: useEM, useRef: useRefM } = React;

function IdentifyModal({ open, onClose, onSubmit, data, setData }) {
  const update = (k, v) => setData((d) => ({ ...d, [k]: v }));
  const [emailErr, setEmailErr] = useSM('');
  const [phoneErr, setPhoneErr] = useSM('');
  const [tried, setTried] = useSM(false);
  const firstRef = useRefM(null);

  useEM(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => firstRef.current && firstRef.current.focus(), 350);
    } else { document.body.style.overflow = ''; }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const validateEmail = (v) => {
    if (!v) return 'E-mail é obrigatório.';
    if (!isCorporateEmail(v)) return 'Use um e-mail corporativo (não aceitamos Gmail, Hotmail, etc.).';
    return '';
  };
  const validatePhone = (v) => {
    if (!v) return 'WhatsApp é obrigatório.';
    if (!isValidPhone(v)) return 'Informe um número válido com DDD. Ex: (11) 98765-4321';
    return '';
  };

  const onEmailChange = (v) => {
    update('email', v);
    if (tried) setEmailErr(validateEmail(v));
  };
  const onPhoneChange = (v) => {
    const masked = formatPhone(v);
    update('telefone', masked);
    if (tried) setPhoneErr(validatePhone(masked));
  };

  const valid =
    (data.nome || '').trim().length >= 3 &&
    isCorporateEmail(data.email || '') &&
    isValidPhone(data.telefone || '') &&
    (data.empresa || '').trim().length >= 2 &&
    !!data.tamanho;

  const handleSubmit = () => {
    setTried(true);
    setEmailErr(validateEmail(data.email));
    setPhoneErr(validatePhone(data.telefone));
    if (valid) onSubmit();
  };

  return (
    <div className={`modal-overlay ${open ? 'open' : ''}`} role="dialog" aria-modal="true">
      <div className="modal">
        <div className="modal-icon">🎯</div>
        <h3>Falta pouco para ver seu <em>diagnóstico</em>.</h3>
        <p className="sub">Preencha os dados para liberar sua análise personalizada. Todos os campos marcados com * são obrigatórios.</p>

        <div className="form-stack">
          <div className="field">
            <label><span>Nome completo *</span><span className="badge">01</span></label>
            <input ref={firstRef} type="text" value={data.nome || ''} onChange={(e) => update('nome', e.target.value)}
              placeholder="Seu nome completo"
              className={tried && (data.nome || '').trim().length < 3 ? 'invalid' : ''} />
          </div>

          <div className="field">
            <label><span>E-mail corporativo *</span><span className="badge">02</span></label>
            <input type="email" value={data.email || ''} onChange={(e) => onEmailChange(e.target.value)}
              placeholder="seu.email@empresa.com.br" className={emailErr ? 'invalid' : ''} />
            <div className="hint" style={emailErr ? { color: 'var(--danger)' } : {}}>
              {emailErr || 'Apenas e-mails corporativos — Gmail, Hotmail, Yahoo não são aceitos.'}
            </div>
          </div>

          <div className="field">
            <label><span>WhatsApp *</span><span className="badge">03</span></label>
            <input type="tel" value={data.telefone || ''} onChange={(e) => onPhoneChange(e.target.value)}
              placeholder="(11) 98765-4321" className={phoneErr ? 'invalid' : ''} inputMode="tel" />
            <div className="hint" style={phoneErr ? { color: 'var(--danger)' } : {}}>
              {phoneErr || 'Vamos enviar o relatório completo no seu WhatsApp.'}
            </div>
          </div>

          <div className="field">
            <label><span>Empresa *</span><span className="badge">04</span></label>
            <input type="text" value={data.empresa || ''} onChange={(e) => update('empresa', e.target.value)}
              placeholder="Nome da sua empresa"
              className={tried && (data.empresa || '').trim().length < 2 ? 'invalid' : ''} />
          </div>

          <div className="field">
            <label><span>Cargo</span><span className="badge">05</span></label>
            <input type="text" value={data.cargo || ''} onChange={(e) => update('cargo', e.target.value)}
              placeholder="CEO, Diretor Comercial, Head de CS…" />
          </div>

          <div className="field">
            <label><span>Tamanho da empresa *</span><span className="badge">06</span></label>
            <select value={data.tamanho || ''} onChange={(e) => update('tamanho', e.target.value)}
              className={tried && !data.tamanho ? 'invalid' : ''}>
              <option value="">Selecione…</option>
              <option value="ate-10">Até 10 funcionários</option>
              <option value="11-50">11 a 50 funcionários</option>
              <option value="51-200">51 a 200 funcionários</option>
              <option value="201-500">201 a 500 funcionários</option>
              <option value="500+">Mais de 500 funcionários</option>
            </select>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-purple" onClick={handleSubmit}>
            Liberar meu diagnóstico <span className="arr">→</span>
          </button>
        </div>

        <div className="modal-privacy">
          🔒 Seus dados estão seguros. Não compartilhamos com terceiros.
        </div>
      </div>
    </div>
  );
}

window.IdentifyModal = IdentifyModal;
