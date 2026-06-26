// ═══════════════════════════════════════════════════
// EmailJS — Notificação interna para o time Engage
//
// COMO CONFIGURAR:
// 1. Acesse https://www.emailjs.com/ e crie uma conta
// 2. Em "Email Services", conecte seu Gmail/Outlook e copie o Service ID
// 3. Em "Email Templates", crie um template e copie o Template ID
// 4. Em "Account > API Keys", copie a Public Key
// 5. Preencha os 3 valores abaixo e faça deploy
//
// VARIÁVEIS disponíveis no template EmailJS:
//   {{nome}}            → nome completo do lead
//   {{email}}           → e-mail corporativo
//   {{telefone}}        → WhatsApp com DDD
//   {{empresa}}         → nome da empresa
//   {{cargo}}           → cargo (opcional)
//   {{tamanho}}         → tamanho da empresa
//   {{base_clientes}}   → base de clientes informada
//   {{receita_total}}   → receita potencial total (formatada)
//   {{perda_diaria}}    → perda diária (formatada)
//   {{receita_indicacoes}} → receita por indicações
//   {{receita_expansoes}}  → receita por expansões
//   {{receita_recorrente}} → receita recorrente
//   {{novos_clientes}}  → novos clientes por indicação
//   {{expansoes}}       → expansões previstas
//   {{data_agenda}}     → data do agendamento (se houver)
//   {{hora_agenda}}     → horário do agendamento (se houver)
//   {{timestamp}}       → data/hora do preenchimento
// ═══════════════════════════════════════════════════

const EMAILJS_CONFIG = {
  publicKey:  'F1yr2isemM-R6Z0D9',  // ✅ configurado
  serviceId:  'service_1qf1ozb',     // ✅ configurado
  templateId: 'Forms_LP_2',          // ✅ configurado
};

// ── Inicialização ──────────────────────────────────
let _ejsReady = false;

function initEmailJS() {
  if (_ejsReady) return true;
  if (typeof emailjs === 'undefined') {
    console.error('[EmailJS] SDK não carregado ainda.');
    return false;
  }
  try {
    emailjs.init({ publicKey: EMAILJS_CONFIG.publicKey });
    _ejsReady = true;
    console.log('[EmailJS] Inicializado ✓');
    return true;
  } catch (e) {
    console.error('[EmailJS] init falhou', e);
    return false;
  }
}

// Inicializa assim que o DOM carregar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initEmailJS);
} else {
  setTimeout(initEmailJS, 100); // garante que o SDK CDN já foi avaliado
}

// ── Monta payload com todos os dados do lead ───────
function buildPayload(data, calc) {
  return {
    // Dados pessoais
    nome:       data.nome        || '',
    email:      data.email       || '',
    telefone:   data.telefone    || '',
    empresa:    data.empresa     || '',
    cargo:      data.cargo       || '',
    tamanho:    data.tamanho     || '',
    // Inputs da calculadora
    base_clientes:        data.baseClientes          || '0',
    pct_elegivel:         data.percentualElegivel     || '0',
    taxa_indicacao:       data.taxaIndicacao          || '0',
    conversao_indicados:  data.conversaoIndicados     || '0',
    ticket_indicacao:     data.ticketMedioIndicacao   || '0',
    pct_expansao:         data.percentualExpansao     || '0',
    propensao_expansao:   data.propensaoExpansao      || '0',
    ticket_expansao:      data.ticketMedioExpansao    || '0',
    recorrente_input:     data.servicosRecorrentes    || '0',
    quedas_input:         data.quedasPrevistas        || '0',
    // Resultados calculados
    receita_indicacoes:  fmtBRL(calc.receitaIndicacoes),
    receita_expansoes:   fmtBRL(calc.receitaExpansoes),
    receita_recorrente:  fmtBRL(calc.recorrente),
    quedas:              fmtBRL(calc.quedas),
    receita_total:       fmtBRL(calc.total),
    perda_diaria:        fmtBRL(calc.diario),
    novos_clientes:      String(calc.conversoes),
    expansoes:           String(calc.expansoes),
    // Agenda
    data_agenda:  data.dataAgenda   || 'Não agendou',
    hora_agenda:  data.horaAgenda   || '—',
    observacoes:  data.observacoes  || '—',
    // Meta
    timestamp: new Date().toLocaleString('pt-BR'),
    origem: window.location.href,
  };
}

// ── Envio principal — dispara ao submeter o modal de identificação ──
async function enviarLead(data, calcResult) {
  // Tenta inicializar mesmo que já tenha falhado antes
  _ejsReady = false;
  if (!initEmailJS()) {
    console.warn('[EmailJS] SDK indisponível — email não enviado.');
    return { ok: false, simulated: true };
  }
  const payload = buildPayload(data, calcResult);
  console.log('[EmailJS] Enviando lead…', payload);
  try {
    const result = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateId,
      payload
    );
    console.log('[EmailJS] Lead enviado ✓ status:', result.status, result.text);
    return { ok: true, status: result.status };
  } catch (e) {
    console.error('[EmailJS] Falha ao enviar lead:', e);
    return { ok: false, error: e.text || e.message || String(e) };
  }
}

// ── Envio ao confirmar agendamento ─────────────────
async function enviarAgenda(data, calcResult) {
  _ejsReady = false;
  if (!initEmailJS()) {
    console.warn('[EmailJS] SDK indisponível — agendamento não enviado.');
    return { ok: false, simulated: true };
  }
  const payload = {
    ...buildPayload(data, calcResult),
    tipo: 'AGENDAMENTO',
    data_agenda: data.dataAgenda  || '—',
    hora_agenda: data.horaAgenda  || '—',
    observacoes: data.observacoes || '—',
  };
  console.log('[EmailJS] Enviando agendamento…', payload);
  try {
    const result = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateId,
      payload
    );
    console.log('[EmailJS] Agendamento enviado ✓ status:', result.status, result.text);
    return { ok: true, status: result.status };
  } catch (e) {
    console.error('[EmailJS] Falha ao enviar agendamento:', e);
    return { ok: false, error: e.text || e.message || String(e) };
  }
}

// ── 2º e-mail: lead clicou em “Sim, quero receber a análise” ──
async function enviarAnaliseIA(data, calcResult, texto, consent) {
  _ejsReady = false;
  if (!initEmailJS()) {
    console.warn('[EmailJS] SDK indisponível — consent não enviado.');
    return { ok: false, simulated: true };
  }
  const payload = {
    ...buildPayload(data, calcResult),
    tipo:             'CONSENTIMENTO_ANALISE_IA',
    consent_email:    consent.email    ? 'Sim' : 'Não',
    consent_whatsapp: consent.whatsapp ? 'Sim' : 'Não',
    analise_ia:       texto ? texto.slice(0, 3000) : '(não gerada)',
  };
  console.log('[EmailJS] Enviando consent…', payload);
  try {
    const result = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateId,
      payload
    );
    console.log('[EmailJS] Consent enviado ✓ status:', result.status, result.text);
    return { ok: true, status: result.status };
  } catch (e) {
    console.error('[EmailJS] Falha ao enviar consent:', e);
    return { ok: false, error: e.text || e.message || String(e) };
  }
}

window.EMAILJS_CONFIG = EMAILJS_CONFIG;
window.enviarLead     = enviarLead;
window.enviarAgenda   = enviarAgenda;
window.enviarAnaliseIA = enviarAnaliseIA;
