// IA Diagnostic — gera diagnóstico orientado à Engage
// Usa window.claude.complete (Haiku 4.5) — não exige API key

async function gerarDiagnosticoIA(data, calculo) {
  const ctx = `
DADOS DO LEAD:
- Nome: ${data.nome || 'N/A'}
- Empresa: ${data.empresa || 'N/A'}
- Cargo: ${data.cargo || 'N/A'}
- Tamanho: ${data.tamanho || 'N/A'}

NÚMEROS DA OPERAÇÃO:
- Base de clientes ativos: ${data.baseClientes}
- % da base que pode indicar: ${data.percentualElegivel}%
- Indicações esperadas por cliente em 90 dias: ${data.taxaIndicacao}
- % conversão de indicados: ${data.conversaoIndicados}%
- Ticket médio de indicação: R$ ${data.ticketMedioIndicacao}
- % da base com potencial de expansão: ${data.percentualExpansao}%
- % que deve expandir em 90 dias: ${data.propensaoExpansao}%
- Ticket médio de expansão: R$ ${data.ticketMedioExpansao}
- Receita recorrente esperada: R$ ${data.servicosRecorrentes}
- Quedas previstas: R$ ${data.quedasPrevistas}

RESULTADOS CALCULADOS (90 dias):
- Indicações qualificadas: ${calculo.indicacoesEsperadas}
- Novos clientes por indicação: ${calculo.conversoes}
- Receita por indicações: R$ ${calculo.receitaIndicacoes.toFixed(2)}
- Expansões previstas: ${calculo.expansoes}
- Receita por expansões: R$ ${calculo.receitaExpansoes.toFixed(2)}
- Receita recorrente: R$ ${calculo.recorrente.toFixed(2)}
- Quedas: R$ ${calculo.quedas.toFixed(2)}
- RECEITA TOTAL POTENCIAL: R$ ${calculo.total.toFixed(2)}
- Perda diária se não agir: R$ ${calculo.diario.toFixed(2)}
`;

  const systemPrompt = `Você é um consultor sênior da ENGAGE (useengage.com.br), uma metodologia que ajuda empresas B2B brasileiras a transformarem suas bases de clientes em motor de crescimento previsível através de indicações estruturadas, expansão (upsell/cross-sell) e retenção.

SEU PAPEL: Gerar um diagnóstico estratégico personalizado, agudo e impactante, baseado nos números do lead. O objetivo é fazer o lead PERCEBER que:
1. Há receita REAL e SIGNIFICATIVA escondida na base dele
2. Capturar essa receita exige MÉTODO, não esforço pontual
3. Tentar resolver internamente leva meses sem garantia — a Engage faz em 90 dias com previsibilidade
4. Cada dia sem ação é dinheiro perdido que não volta

TOM: Direto, executivo, brasileiro, sem floreios. Use números do lead. Soe como um consultor que viu 200 cases parecidos.

FORMATO (markdown leve, máx 350 palavras):

## 🎯 Diagnóstico para [empresa]

### O que seus números revelam
[2-3 frases conectando o tamanho da base, ticket e potencial. Use o número de receita total. Mostre que conhece a operação dele.]

### 3 pontos críticos
**1. [Título objetivo]** — [análise específica usando os números do lead, 1-2 frases]
**2. [Título objetivo]** — [análise, 1-2 frases]
**3. [Título objetivo]** — [análise, 1-2 frases]

### Por que tentar sozinho é arriscado
[3 frases sobre por que esse problema parece simples mas exige metodologia, tecnologia e processo. Cite o tempo médio (12+ meses) que empresas levam tentando internamente. Mencione que a maioria desiste antes de ver retorno.]

### O caminho da Engage
Em 90 dias, implementamos os 3 pilares: **Indicações estruturadas**, **Motor de Expansão** e **Prevenção de Churn**. Você sai com R$ [valor] efetivamente capturados, não só projetados.

➡️ **Sua próxima ação:** agendar 30 minutos de diagnóstico aprofundado com nosso time. Levamos seu cenário para o detalhe e mostramos exatamente como destravar esse potencial.

REGRAS:
- Use SEMPRE o nome da empresa
- Cite valores específicos em R$ (use os números do calculation)
- NÃO invente dados que não foram fornecidos
- NÃO recomende soluções genéricas (ferramentas, dicas isoladas) — só a Engage
- NÃO seja agressivo nem alarmista — seja direto e factual
- Termine direcionando para o agendamento`;

  const userPrompt = `Gere o diagnóstico para este lead:\n${ctx}`;

  try {
    const response = await window.claude.complete({
      messages: [
        { role: 'user', content: systemPrompt + '\n\n' + userPrompt }
      ],
    });
    return { ok: true, text: response };
  } catch (e) {
    console.error('Erro IA:', e);
    return { ok: false, error: e.message || 'Erro desconhecido' };
  }
}

// Markdown render simples
function renderMarkdown(md) {
  if (!md) return '';
  let html = md
    .replace(/###\s+(.+)$/gm, '<h3>$1</h3>')
    .replace(/##\s+(.+)$/gm, '<h2>$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/➡️\s*(.+?)$/gm, '<p class="ai-cta">➡️ $1</p>');

  // Convert paragraphs (split on double newline)
  html = html.split(/\n\n+/).map(block => {
    block = block.trim();
    if (!block) return '';
    if (block.startsWith('<h') || block.startsWith('<p')) return block;
    return `<p>${block.replace(/\n/g, '<br/>')}</p>`;
  }).join('\n');

  return html;
}

window.gerarDiagnosticoIA = gerarDiagnosticoIA;
window.renderMarkdown = renderMarkdown;
