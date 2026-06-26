// State + storage + calculations
const STORAGE_KEY = 'calculadora_dados';

const DEFAULT_DATA = {
  baseClientes: '',
  percentualElegivel: 20,
  taxaIndicacao: '',
  conversaoIndicados: 25,
  ticketMedioIndicacao: '',
  percentualExpansao: 20,
  propensaoExpansao: 50,
  ticketMedioExpansao: '',
  servicosRecorrentes: '',
  quedasPrevistas: 0,
  nome: '',
  email: '',
  telefone: '',
  empresa: '',
  cargo: '',
  tamanho: '',
  // Agenda
  dataAgenda: '',
  horaAgenda: '',
  observacoes: '',
};

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_DATA };
    return { ...DEFAULT_DATA, ...JSON.parse(raw) };
  } catch (e) { return { ...DEFAULT_DATA }; }
}

function saveData(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) {}
}

function clearData() {
  try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
}

const BLOCKED_DOMAINS = ['gmail.com','hotmail.com','outlook.com','yahoo.com','live.com','icloud.com','yahoo.com.br','outlook.com.br','hotmail.com.br','bol.com.br','uol.com.br','terra.com.br'];

function isCorporateEmail(email) {
  if (!email || !email.includes('@')) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) return false;
  const domain = email.split('@')[1].toLowerCase();
  return !BLOCKED_DOMAINS.includes(domain);
}

function isValidPhone(phone) {
  if (!phone) return false;
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 13;
}

function formatPhone(value) {
  const digits = (value || '').replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0,2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0,2)}) ${digits.slice(2,6)}-${digits.slice(6)}`;
  return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7,11)}`;
}

function n(v) { const x = parseFloat(v); return isNaN(x) ? 0 : x; }

function calc(data) {
  const base = n(data.baseClientes);
  const elegivel = base * (n(data.percentualElegivel) / 100);
  const indicacoesEsperadas = elegivel * n(data.taxaIndicacao);
  const conversoes = Math.round(indicacoesEsperadas * (n(data.conversaoIndicados) / 100));
  const receitaIndicacoes = conversoes * n(data.ticketMedioIndicacao);

  const potencial = base * (n(data.percentualExpansao) / 100);
  const expansoes = Math.round(potencial * (n(data.propensaoExpansao) / 100));
  const receitaExpansoes = expansoes * n(data.ticketMedioExpansao);

  const recorrente = n(data.servicosRecorrentes);
  const quedas = n(data.quedasPrevistas);
  const total = receitaIndicacoes + receitaExpansoes + recorrente - quedas;

  return {
    indicacoesEsperadas: Math.round(indicacoesEsperadas),
    conversoes,
    receitaIndicacoes,
    expansoes,
    receitaExpansoes,
    recorrente,
    quedas,
    total,
    diario: total / 90,
  };
}

const fmtBRL = (v, opts = {}) => {
  const value = isNaN(v) ? 0 : v;
  return value.toLocaleString('pt-BR', {
    style: 'currency', currency: 'BRL',
    minimumFractionDigits: opts.dec ?? 0,
    maximumFractionDigits: opts.dec ?? 0,
  });
};

const fmtNum = (v) => Math.round(v || 0).toLocaleString('pt-BR');

// Split currency into parts for styled display
const splitBRL = (v) => {
  const value = isNaN(v) ? 0 : v;
  const [main, cents] = Math.abs(value).toLocaleString('pt-BR', {
    minimumFractionDigits: 2, maximumFractionDigits: 2
  }).split(',');
  return { sign: value < 0 ? '-' : '', main, cents };
};

Object.assign(window, {
  STORAGE_KEY, DEFAULT_DATA, loadData, saveData, clearData,
  isCorporateEmail, isValidPhone, formatPhone,
  calc, fmtBRL, fmtNum, splitBRL, n,
});
