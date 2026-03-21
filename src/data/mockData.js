export const mockSummary = {
  total: 0,
  successes: 0,
  successRate: 0,
  byProcedureGroup: [
    {
      groupLabel: "Via Aérea",
      category: "via_aerea",
      items: []
    },
    {
      groupLabel: "Bloqueios Regionais",
      category: "regional",
      items: []
    },
    {
      groupLabel: "Acessos Vasculares",
      category: "acesso",
      items: []
    }
  ],
  failureProcedures: []
};

export const mockTimeline = [];

// Função para calcular estatísticas a partir dos dados salvos
export function calcularEstatisticas() {
  const procedimentos = JSON.parse(localStorage.getItem("procedimentos") || "[]");
  
  if (procedimentos.length === 0) {
    return mockSummary;
  }

  const total = procedimentos.length;
  const successes = procedimentos.filter(p => p.sucesso).length;
  const successRate = total > 0 ? (successes / total) * 100 : 0;

  // Agrupar por categoria
  const categorias = {
    "Via Aérea": { category: "via_aerea", items: {} },
    "Bloqueios Regionais": { category: "regional", items: {} },
    "Acessos Vasculares": { category: "acesso", items: {} }
  };

  procedimentos.forEach(p => {
    if (categorias[p.categoria]) {
      if (!categorias[p.categoria].items[p.procedimento]) {
        categorias[p.categoria].items[p.procedimento] = { total: 0, successes: 0 };
      }
      categorias[p.categoria].items[p.procedimento].total++;
      if (p.sucesso) {
        categorias[p.categoria].items[p.procedimento].successes++;
      }
    }
  });

  const byProcedureGroup = Object.entries(categorias).map(([groupLabel, data]) => ({
    groupLabel,
    category: data.category,
    items: Object.entries(data.items).map(([label, stats]) => ({
      label,
      total: stats.total,
      successes: stats.successes,
      successRate: stats.total > 0 ? (stats.successes / stats.total) * 100 : 0
    }))
  }));

  // Procedimentos com menor taxa de sucesso (< 80%)
  const allProcedures = byProcedureGroup.flatMap(g => g.items);
  const failureProcedures = allProcedures
    .filter(p => p.total >= 1 && p.successRate < 80)
    .sort((a, b) => a.successRate - b.successRate)
    .slice(0, 3)
    .map(p => ({
      type: p.label,
      subtype: null,
      total: p.total,
      successRate: p.successRate
    }));

  return {
    total,
    successes,
    successRate,
    byProcedureGroup,
    failureProcedures
  };
}
