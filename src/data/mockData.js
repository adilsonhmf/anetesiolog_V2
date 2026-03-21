export const mockSummary = {
  total: 47,
  successes: 38,
  successRate: 80.9,
  byProcedureGroup: [
    {
      groupLabel: "Via Aérea",
      category: "via_aerea",
      items: [
        { label: "Intubação Orotraqueal", total: 25, successes: 22, successRate: 88 },
        { label: "Máscara Laríngea", total: 8, successes: 7, successRate: 87.5 },
        { label: "Videolaringoscopia", total: 5, successes: 4, successRate: 80 },
      ]
    },
    {
      groupLabel: "Bloqueios Regionais",
      category: "regional",
      items: [
        { label: "Raquianestesia", total: 12, successes: 10, successRate: 83.3 },
        { label: "Peridural", total: 6, successes: 4, successRate: 66.7 },
        { label: "Bloqueio de Plexo Braquial", total: 3, successes: 2, successRate: 66.7 },
      ]
    },
    {
      groupLabel: "Acessos Vasculares",
      category: "acesso",
      items: [
        { label: "Acesso Venoso Central", total: 8, successes: 6, successRate: 75 },
        { label: "Punção Arterial", total: 5, successes: 5, successRate: 100 },
      ]
    }
  ],
  failureProcedures: [
    { type: "Peridural", subtype: null, total: 6, successRate: 66.7 },
    { type: "Bloqueio de Plexo Braquial", subtype: null, total: 3, successRate: 66.7 },
  ]
};

export const mockTimeline = [
  { label: "2026-03-01", total: 5, successes: 4 },
  { label: "2026-03-05", total: 7, successes: 6 },
  { label: "2026-03-08", total: 4, successes: 3 },
  { label: "2026-03-12", total: 8, successes: 7 },
  { label: "2026-03-15", total: 6, successes: 5 },
  { label: "2026-03-18", total: 9, successes: 8 },
  { label: "2026-03-20", total: 5, successes: 4 },
  { label: "2026-03-21", total: 3, successes: 3 },
];
