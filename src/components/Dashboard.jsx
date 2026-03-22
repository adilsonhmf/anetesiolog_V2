import React, { useState, useEffect } from "react";
import { buscarProcedimentos } from "../firestoreService";
import { auth } from "../firebase";
import "./Dashboard.css";

function getSuccessColor(rate, total) {
  if (total === 0) return "#4a4a5e";
  if (rate >= 80) return "#10b981";
  if (rate >= 60) return "#f59e0b";
  return "#ef4444";
}

function calcularEstatisticasFromData(procedimentos) {
  const total = procedimentos.length;
  const successes = procedimentos.filter(p => p.sucesso).length;
  const successRate = total > 0 ? (successes / total) * 100 : 0;

  const grupos = {
    "Via Aérea": {},
    "Neuroeixo": {},
    "Bloqueios Regionais": {},
    "Acessos Vasculares": {}
  };

  procedimentos.forEach(p => {
    const cat = p.categoria || "Outros";
    const proc = p.procedimento || "Desconhecido";
    
    if (!grupos[cat]) grupos[cat] = {};
    if (!grupos[cat][proc]) {
      grupos[cat][proc] = { total: 0, successes: 0 };
    }
    grupos[cat][proc].total++;
    if (p.sucesso) grupos[cat][proc].successes++;
  });

  const byProcedureGroup = Object.entries(grupos).map(([groupLabel, procs]) => ({
    groupLabel,
    items: Object.entries(procs).map(([label, data]) => ({
      label,
      total: data.total,
      successes: data.successes,
      successRate: data.total > 0 ? (data.successes / data.total) * 100 : 0
    }))
  }));

  return { total, successes, successRate, byProcedureGroup };
}

function StatCard({ label, value, icon, color }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <p className="stat-label">{label}</p>
      <p className="stat-value" style={{ color: color || "#ffffff" }}>{value}</p>
    </div>
  );
}

function BarChart({ data }) {
  const maxValue = Math.max(...data.map(d => d.total), 1);
  
  return (
    <div className="chart-container">
      <h3 className="chart-title">Procedimentos por Categoria</h3>
      <div className="bar-chart">
        {data.map((item, idx) => (
          <div key={idx} className="bar-row">
            <span className="bar-label">{item.label}</span>
            <div className="bar-track">
              <div 
                className="bar-fill"
                style={{ 
                  width: `${(item.total / maxValue) * 100}%`,
                  background: `linear-gradient(90deg, ${item.color} 0%, ${item.colorEnd} 100%)`
                }}
              />
            </div>
            <span className="bar-value">{item.total}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LineChart({ data }) {
  if (data.length < 2) {
    return (
      <div className="chart-container">
        <h3 className="chart-title">Evolução Semanal</h3>
        <p className="chart-empty">Registre mais procedimentos para ver a evolução</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.total), 1);
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - (d.total / maxValue) * 80;
    return `${x},${y}`;
  }).join(' ');

  const successPoints = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - (d.successRate) * 0.8;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="chart-container">
      <h3 className="chart-title">Evolução Semanal</h3>
      <div className="line-chart">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="chart-svg">
          <line x1="0" y1="25" x2="100" y2="25" stroke="#2a2a3e" strokeWidth="0.5"/>
          <line x1="0" y1="50" x2="100" y2="50" stroke="#2a2a3e" strokeWidth="0.5"/>
          <line x1="0" y1="75" x2="100" y2="75" stroke="#2a2a3e" strokeWidth="0.5"/>
          
          <polyline
            points={successPoints}
            fill="none"
            stroke="#06b6d4"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          <polyline
            points={points}
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="chart-legend">
          <div className="legend-item">
            <span className="legend-dot" style={{background: '#10b981'}}></span>
            <span>Procedimentos</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{background: '#06b6d4'}}></span>
            <span>Taxa Sucesso</span>
          </div>
        </div>
        <div className="chart-labels">
          {data.map((d, i) => (
            <span key={i} className="chart-label-x">{d.label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function DonutChart({ successRate, total }) {
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (successRate / 100) * circumference;
  
  return (
    <div className="donut-container">
      <svg viewBox="0 0 100 100" className="donut-svg">
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="#2a2a3e"
          strokeWidth="8"
        />
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="url(#gradient)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 50 50)"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
      <div className="donut-center">
        <span className="donut-value">{total > 0 ? `${successRate.toFixed(0)}%` : '—'}</span>
        <span className="donut-label">Sucesso</span>
      </div>
    </div>
  );
}

function ProcedureGroup({ group }) {
  const [expanded, setExpanded] = useState(false);
  
  const groupTotal = group.items.reduce((s, i) => s + i.total, 0);
  const groupSuccesses = group.items.reduce((s, i) => s + i.successes, 0);
  const groupRate = groupTotal > 0 ? (groupSuccesses / groupTotal) * 100 : 0;
  const rateColor = getSuccessColor(groupRate, groupTotal);

  if (groupTotal === 0) return null;

  return (
    <div className="group-card">
      <div className="group-header" onClick={() => setExpanded(!expanded)}>
        <div className="group-left">
          <div className="group-dot" />
          <div className="group-info">
            <span className="group-label">{group.groupLabel}</span>
            <span className="group-meta">
              {groupTotal} proc · {groupRate.toFixed(0)}% sucesso
            </span>
          </div>
        </div>
        <div className="group-right">
          <span className="group-rate" style={{ color: rateColor }}>
            {groupRate.toFixed(0)}%
          </span>
          <span className="chevron">{expanded ? "▲" : "▼"}</span>
        </div>
      </div>

      {expanded && (
        <div className="group-body">
          {group.items.filter(item => item.total > 0).map((item, idx) => (
            <div key={idx} className="procedure-row">
              <div className="procedure-info">
                <span className="procedure-name">{item.label}</span>
                <span className="procedure-meta">
                  {item.total} proc · {item.successes} sucesso{item.successes !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="procedure-right">
                <span 
                  className="procedure-rate" 
                  style={{ color: getSuccessColor(item.successRate, item.total) }}
                >
                  {item.successRate.toFixed(0)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function Dashboard() {
  const [summary, setSummary] = useState({ total: 0, successes: 0, successRate: 0, byProcedureGroup: [] });
  const [procedimentos, setProcedimentos] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        setLoading(false);
        return;
      }

      const dados = await buscarProcedimentos(userId);
      setProcedimentos(dados);
      setSummary(calcularEstatisticasFromData(dados));
      
      // Calcular dados semanais
      const hoje = new Date();
      const semanas = [];
      for (let i = 3; i >= 0; i--) {
        const inicioSemana = new Date(hoje);
        inicioSemana.setDate(hoje.getDate() - (i * 7) - hoje.getDay());
        const fimSemana = new Date(inicioSemana);
        fimSemana.setDate(inicioSemana.getDate() + 6);
        
        const procSemana = dados.filter(p => {
          const dataProc = new Date(p.data);
          return dataProc >= inicioSemana && dataProc <= fimSemana;
        });
        
        const total = procSemana.length;
        const sucessos = procSemana.filter(p => p.sucesso).length;
        
        semanas.push({
          label: `S${4-i}`,
          total,
          successRate: total > 0 ? (sucessos / total) * 100 : 0
        });
      }
      setWeeklyData(semanas);
    } catch (error) {
      console.error("Erro ao carregar:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  const barData = [
    { label: "Via Aérea", total: 0, color: "#10b981", colorEnd: "#059669" },
    { label: "Neuroeixo", total: 0, color: "#8b5cf6", colorEnd: "#7c3aed" },
    { label: "Bloqueios", total: 0, color: "#06b6d4", colorEnd: "#0891b2" },
    { label: "Acessos", total: 0, color: "#f59e0b", colorEnd: "#d97706" }
  ];

  procedimentos.forEach(p => {
    if (p.categoria === "Via Aérea") barData[0].total++;
    else if (p.categoria === "Neuroeixo") barData[1].total++;
    else if (p.categoria === "Bloqueios Regionais") barData[2].total++;
    else if (p.categoria === "Acessos Vasculares") barData[3].total++;
  });

  if (loading) {
    return (
      <div className="dashboard">
        <div className="empty-state">
          <span className="empty-icon">☁️</span>
          <h3>Carregando...</h3>
          <p>Buscando dados da nuvem</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="header">
        <div>
          <p className="greeting">Bem-vindo de volta</p>
          <h1 className="title">AnestesioLOG</h1>
        </div>
        <div className="avatar">🩺</div>
      </div>

      <div className="stats-row">
        <div className="stat-card-large">
          <DonutChart successRate={summary.successRate} total={summary.total} />
        </div>
        <div className="stats-col">
          <StatCard
            label="Total"
            value={summary.total}
            icon="📋"
            color="#10b981"
          />
          <StatCard
            label="Sucessos"
            value={summary.successes}
            icon="✅"
            color="#06b6d4"
          />
        </div>
      </div>

      {summary.total === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📝</span>
          <h3>Nenhum procedimento</h3>
          <p>Clique em <strong>Registrar</strong> para começar!</p>
        </div>
      ) : (
        <>
          <BarChart data={barData.filter(d => d.total > 0)} />
          <LineChart data={weeklyData} />

          <div className="section">
            <h2 className="section-title">Curva de Aprendizado</h2>
            <p className="section-desc">Taxa de sucesso por procedimento</p>

            {summary.byProcedureGroup.map((group) => (
              <ProcedureGroup key={group.groupLabel} group={group} />
            ))}
          </div>

          <div className="section">
            <h2 className="section-title">Últimos Registros</h2>

            <div className="history-list">
              {procedimentos.slice(0, 5).map((proc) => (
                <div key={proc.id} className="history-item">
                  <div className="history-left">
                    <span className={`history-status ${proc.sucesso ? 'success' : 'fail'}`}>
                      {proc.sucesso ? '✓' : '✗'}
                    </span>
                    <div className="history-info">
                      <span className="history-proc">{proc.procedimento}</span>
                      <span className="history-meta">
                        {proc.categoria} · {proc.tentativas || 1} tent.
                        {proc.tags && proc.tags.length > 0 && ` · ${proc.tags.join(', ')}`}
                      </span>
                    </div>
                  </div>
                  <div className="history-right">
                    <span className="history-date">{formatDate(proc.data)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
