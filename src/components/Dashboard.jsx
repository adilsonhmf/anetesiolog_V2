import React, { useState, useEffect } from "react";
import { buscarProcedimentos, excluirProcedimento, buscarConfiguracoes } from "../firestoreService";
import { auth } from "../firebase";
import "./Dashboard.css";

function getSuccessColor(rate) {
  if (rate >= 80) return "#10b981";
  if (rate >= 60) return "#f59e0b";
  return "#ef4444";
}

function calcularEstatisticas(procedimentos) {
  const total = procedimentos.length;
  const successes = procedimentos.filter(p => p.sucesso).length;
  const successRate = total > 0 ? (successes / total) * 100 : 0;

  // Este mês
  const hoje = new Date();
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const esteMes = procedimentos.filter(p => new Date(p.data) >= inicioMes).length;

  // Recorde
  const porDia = {};
  procedimentos.forEach(p => {
    const dataKey = p.data?.split('T')[0] || p.data;
    porDia[dataKey] = (porDia[dataKey] || 0) + 1;
  });
  const recorde = Math.max(0, ...Object.values(porDia));

  // Agrupar por tipo
  const grupos = {};
  procedimentos.forEach(p => {
    const tipo = p.categoria || p.tipo || "Outros";
    const proc = p.procedimento || p.subdivisao || "Desconhecido";
    if (!grupos[tipo]) grupos[tipo] = { items: {}, total: 0, successes: 0, procedimentos: [] };
    if (!grupos[tipo].items[proc]) grupos[tipo].items[proc] = { total: 0, successes: 0, streak: 0, procedimentos: [] };
    grupos[tipo].items[proc].total++;
    grupos[tipo].items[proc].procedimentos.push(p);
    grupos[tipo].total++;
    grupos[tipo].procedimentos.push(p);
    if (p.sucesso) {
      grupos[tipo].items[proc].successes++;
      grupos[tipo].successes++;
    }
  });

  // Calcular streak por subdivisão
  Object.values(grupos).forEach(grupo => {
    Object.values(grupo.items).forEach(item => {
      const sorted = item.procedimentos.sort((a, b) => new Date(b.data) - new Date(a.data));
      let streak = 0;
      for (const p of sorted) {
        if (p.sucesso) streak++;
        else break;
      }
      item.streak = streak;
    });
  });

  const byGroup = Object.entries(grupos).map(([label, data]) => ({
    label,
    total: data.total,
    successes: data.successes,
    rate: data.total > 0 ? (data.successes / data.total) * 100 : 0,
    procedimentos: data.procedimentos,
    items: Object.entries(data.items).map(([name, d]) => ({
      name,
      total: d.total,
      successes: d.successes,
      rate: d.total > 0 ? (d.successes / d.total) * 100 : 0,
      streak: d.streak,
      procedimentos: d.procedimentos
    }))
  }));

  // Dados semanais (últimas 4 semanas)
  const weeklyData = [];
  for (let i = 3; i >= 0; i--) {
    const inicioSemana = new Date(hoje);
    inicioSemana.setDate(hoje.getDate() - (i * 7) - hoje.getDay());
    const fimSemana = new Date(inicioSemana);
    fimSemana.setDate(inicioSemana.getDate() + 6);
    
    const procSemana = procedimentos.filter(p => {
      const dataProc = new Date(p.data);
      return dataProc >= inicioSemana && dataProc <= fimSemana;
    });
    
    const totalSemana = procSemana.length;
    const sucessosSemana = procSemana.filter(p => p.sucesso).length;
    
    weeklyData.push({
      label: `S${4-i}`,
      total: totalSemana,
      successRate: totalSemana > 0 ? (sucessosSemana / totalSemana) * 100 : 0
    });
  }

  return { total, successes, successRate, esteMes, recorde, byGroup, weeklyData };
}

// Componente Donut Chart
function DonutChart({ successRate, total }) {
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (successRate / 100) * circumference;
  
  return (
    <div className="donut-card">
      <svg viewBox="0 0 100 100" className="donut-svg">
        <circle cx="50" cy="50" r="45" fill="none" stroke="#1a1a2e" strokeWidth="10" />
        <circle
          cx="50" cy="50" r="45"
          fill="none"
          stroke="url(#donutGradient)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 50 50)"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
        <defs>
          <linearGradient id="donutGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
      <div className="donut-center">
        <span className="donut-value">{total > 0 ? `${successRate.toFixed(0)}%` : '—'}</span>
        <span className="donut-label">SUCESSO</span>
      </div>
    </div>
  );
}

// Componente Gráfico de Linha
function LineChart({ data }) {
  if (data.length < 2 || data.every(d => d.total === 0)) {
    return (
      <div className="chart-card">
        <h3 className="chart-title">📈 Evolução Semanal</h3>
        <div className="chart-empty">
          <p>Registre mais procedimentos para ver a evolução</p>
        </div>
      </div>
    );
  }

  const maxTotal = Math.max(...data.map(d => d.total), 1);
  
  // Pontos para linha de procedimentos
  const totalPoints = data.map((d, i) => {
    const x = 10 + (i / (data.length - 1)) * 80;
    const y = 85 - (d.total / maxTotal) * 70;
    return `${x},${y}`;
  }).join(' ');

  // Pontos para linha de taxa de sucesso
  const successPoints = data.map((d, i) => {
    const x = 10 + (i / (data.length - 1)) * 80;
    const y = 85 - (d.successRate / 100) * 70;
    return `${x},${y}`;
  }).join(' ');

  // Área preenchida
  const areaPoints = `10,85 ${totalPoints} 90,85`;

  return (
    <div className="chart-card">
      <h3 className="chart-title">📈 Evolução Semanal</h3>
      <div className="line-chart-container">
        <svg viewBox="0 0 100 100" className="line-chart-svg">
          {/* Grid lines */}
          <line x1="10" y1="25" x2="90" y2="25" stroke="#2a2a3e" strokeWidth="0.5" strokeDasharray="2,2" />
          <line x1="10" y1="55" x2="90" y2="55" stroke="#2a2a3e" strokeWidth="0.5" strokeDasharray="2,2" />
          <line x1="10" y1="85" x2="90" y2="85" stroke="#2a2a3e" strokeWidth="0.5" />
          
          {/* Área preenchida */}
          <polygon points={areaPoints} fill="url(#areaGradient)" opacity="0.3" />
          
          {/* Linha de procedimentos */}
          <polyline
            points={totalPoints}
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Linha de taxa de sucesso */}
          <polyline
            points={successPoints}
            fill="none"
            stroke="#06b6d4"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="4,2"
          />
          
          {/* Pontos */}
          {data.map((d, i) => {
            const x = 10 + (i / (data.length - 1)) * 80;
            const y = 85 - (d.total / maxTotal) * 70;
            return <circle key={i} cx={x} cy={y} r="3" fill="#10b981" />;
          })}
          
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Labels */}
        <div className="chart-labels">
          {data.map((d, i) => (
            <span key={i} className="chart-label">{d.label}</span>
          ))}
        </div>
        
        {/* Legenda */}
        <div className="chart-legend">
          <div className="legend-item">
            <span className="legend-dot" style={{ background: '#10b981' }}></span>
            <span>Procedimentos</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ background: '#06b6d4' }}></span>
            <span>Taxa Sucesso</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente de histórico de procedimento
function ProcedimentoHistorico({ proc, onExcluir, excluindo }) {
  const [expandido, setExpandido] = useState(false);
  
  const formatDate = (d) => {
    if (!d) return "";
    const date = new Date(d);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
  };

  return (
    <div className={`historico-item ${expandido ? 'expandido' : ''}`}>
      <div className="historico-header" onClick={() => setExpandido(!expandido)}>
        <span className={`historico-status ${proc.sucesso ? 'success' : 'fail'}`}>
          {proc.sucesso ? '✓' : '✗'}
        </span>
        <div className="historico-info">
          <span className="historico-data">{formatDate(proc.data)}</span>
          <span className="historico-tent">{proc.tentativas || 1} tent.</span>
        </div>
        {proc.tags?.length > 0 && (
          <div className="historico-tags">
            {proc.tags.slice(0, 2).map((tag, i) => (
              <span key={i} className="historico-tag">{tag}</span>
            ))}
          </div>
        )}
        <span className="historico-chevron">{expandido ? '▲' : '▼'}</span>
      </div>
      
      {expandido && (
        <div className="historico-body">
          {proc.observacoes ? (
            <p className="historico-obs">{proc.observacoes}</p>
          ) : (
            <p className="historico-obs vazio">Sem observações</p>
          )}
          {proc.tags?.length > 0 && (
            <div className="historico-todas-tags">
              {proc.tags.map((tag, i) => (
                <span key={i} className="historico-tag">{tag}</span>
              ))}
            </div>
          )}
          <button 
            className="historico-excluir"
            onClick={(e) => { e.stopPropagation(); onExcluir(proc); }}
            disabled={excluindo === proc.id}
          >
            {excluindo === proc.id ? '...' : '🗑️ Excluir'}
          </button>
        </div>
      )}
    </div>
  );
}

// Componente de subdivisão com histórico
function SubdivisaoItem({ item, onExcluir, excluindo }) {
  const [showHistorico, setShowHistorico] = useState(false);
  
  return (
    <div className="subdivisao-container">
      <div className="subdivisao-header" onClick={() => setShowHistorico(!showHistorico)}>
        <div className="subdivisao-info">
          <h4>{item.name}</h4>
          <span className="subdivisao-meta">
            {item.total} proc · {item.successes} suc.
            {item.streak > 0 && <span className="subdivisao-streak">🔥 {item.streak}</span>}
          </span>
        </div>
        <div className="subdivisao-stats">
          <div className="mini-progress">
            <div 
              className="mini-progress-fill" 
              style={{ 
                width: `${item.rate}%`,
                background: getSuccessColor(item.rate)
              }} 
            />
          </div>
          <span className="subdivisao-rate" style={{ color: getSuccessColor(item.rate) }}>
            {item.rate.toFixed(0)}%
          </span>
          <span className="subdivisao-chevron">{showHistorico ? '▲' : '▼'}</span>
        </div>
      </div>
      
      {showHistorico && (
        <div className="subdivisao-historico">
          <h5>📋 Histórico de {item.name}</h5>
          {item.procedimentos
            .sort((a, b) => new Date(b.data) - new Date(a.data))
            .map(proc => (
              <ProcedimentoHistorico 
                key={proc.id} 
                proc={proc} 
                onExcluir={onExcluir}
                excluindo={excluindo}
              />
            ))}
        </div>
      )}
    </div>
  );
}

// Componente de grupo/categoria
function GrupoCard({ group, onExcluir, excluindo, cores, index }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="grupo-card">
      <div className="grupo-header" onClick={() => setExpanded(!expanded)}>
        <div className="grupo-left">
          <div className="grupo-icon" style={{ background: `linear-gradient(135deg, ${cores[index % cores.length]}33, ${cores[index % cores.length]}11)` }}>
            📊
          </div>
          <div className="grupo-info">
            <h3>{group.label}</h3>
            <span className="grupo-meta">{group.total} proc · {group.successes} sucessos</span>
          </div>
        </div>
        <div className="grupo-right">
          <span className="grupo-rate" style={{ color: getSuccessColor(group.rate) }}>
            {group.rate.toFixed(0)}%
          </span>
          <span className="grupo-chevron">{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {expanded && (
        <div className="grupo-body">
          {group.items.map((item, i) => (
            <SubdivisaoItem 
              key={i} 
              item={item} 
              onExcluir={onExcluir}
              excluindo={excluindo}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function Dashboard() {
  const [stats, setStats] = useState({ 
    total: 0, successes: 0, successRate: 0, esteMes: 0, recorde: 0, byGroup: [], weeklyData: [] 
  });
  const [procedimentos, setProcedimentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [excluindo, setExcluindo] = useState(null);
  
  // Metas
  const [metas, setMetas] = useState([]);
  const [showMetaModal, setShowMetaModal] = useState(false);
  const [tiposDisponiveis, setTiposDisponiveis] = useState([]);
  const [subdivisoesDisponiveis, setSubdivisoesDisponiveis] = useState({});
  const [novaMeta, setNovaMeta] = useState({ tipo: "", subdivisao: "", quantidade: 10, dataLimite: "" });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) { setLoading(false); return; }

      const dados = await buscarProcedimentos(userId);
      setProcedimentos(dados);
      setStats(calcularEstatisticas(dados));

      const config = await buscarConfiguracoes(userId);
      setTiposDisponiveis(config.tipos || []);
      setSubdivisoesDisponiveis(config.subdivisoes || {});

      const metasSalvas = JSON.parse(localStorage.getItem(`metas_${userId}`) || "[]");
      setMetas(metasSalvas);
    } catch (error) {
      console.error("Erro:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExcluir = async (proc) => {
    if (!window.confirm(`Excluir procedimento?`)) return;
    setExcluindo(proc.id);
    try {
      await excluirProcedimento(proc.id);
      const novaLista = procedimentos.filter(p => p.id !== proc.id);
      setProcedimentos(novaLista);
      setStats(calcularEstatisticas(novaLista));
    } catch (error) {
      alert("Erro ao excluir");
    } finally {
      setExcluindo(null);
    }
  };

  const calcularProgressoMeta = (meta) => {
    const count = procedimentos.filter(p => {
      const matchTipo = (p.categoria || p.tipo) === meta.tipo;
      const matchSub = !meta.subdivisao || (p.procedimento || p.subdivisao) === meta.subdivisao;
      const matchData = !meta.dataLimite || new Date(p.data) <= new Date(meta.dataLimite);
      return matchTipo && matchSub && matchData;
    }).length;
    return { count, percentage: Math.min((count / meta.quantidade) * 100, 100) };
  };

  const handleSalvarMeta = () => {
    if (!novaMeta.tipo || !novaMeta.quantidade) return;
    const userId = auth.currentUser?.uid;
    const novasMetas = [...metas, { ...novaMeta, id: Date.now() }];
    setMetas(novasMetas);
    localStorage.setItem(`metas_${userId}`, JSON.stringify(novasMetas));
    setShowMetaModal(false);
    setNovaMeta({ tipo: "", subdivisao: "", quantidade: 10, dataLimite: "" });
  };

  const handleExcluirMeta = (id) => {
    const userId = auth.currentUser?.uid;
    const novasMetas = metas.filter(m => m.id !== id);
    setMetas(novasMetas);
    localStorage.setItem(`metas_${userId}`, JSON.stringify(novasMetas));
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : "";

  const cores = ["#10b981", "#8b5cf6", "#06b6d4", "#f59e0b", "#ec4899"];

  if (loading) {
    return <div className="dashboard"><div className="loading"><span>☁️</span><p>Carregando...</p></div></div>;
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="header">
        <div>
          <p className="greeting">Bem-vindo de volta</p>
          <h1 className="title">AnestLOG</h1>
        </div>
        <div className="avatar">🩺</div>
      </div>

      {/* Stats com Donut */}
      <div className="stats-visual">
        <DonutChart successRate={stats.successRate} total={stats.total} />
        <div className="stats-side">
          <div className="stat-mini">
            <span className="stat-mini-icon">📋</span>
            <div>
              <span className="stat-mini-label">TOTAL</span>
              <span className="stat-mini-value">{stats.total}</span>
            </div>
          </div>
          <div className="stat-mini">
            <span className="stat-mini-icon">✅</span>
            <div>
              <span className="stat-mini-label">SUCESSOS</span>
              <span className="stat-mini-value green">{stats.successes}</span>
            </div>
          </div>
          <div className="stat-mini">
            <span className="stat-mini-icon">📅</span>
            <div>
              <span className="stat-mini-label">ESTE MÊS</span>
              <span className="stat-mini-value blue">{stats.esteMes}</span>
            </div>
          </div>
          <div className="stat-mini">
            <span className="stat-mini-icon">🏆</span>
            <div>
              <span className="stat-mini-label">RECORDE</span>
              <span className="stat-mini-value yellow">{stats.recorde}</span>
            </div>
          </div>
        </div>
      </div>

      {stats.total === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📝</span>
          <h3>Nenhum procedimento</h3>
          <p>Clique em <strong>Registrar</strong> para começar!</p>
        </div>
      ) : (
        <>
          {/* Gráfico de Barras por Categoria */}
          <div className="chart-card">
            <h3 className="chart-title">📊 Procedimentos por Categoria</h3>
            <div className="bar-chart">
              {stats.byGroup.map((g, i) => (
                <div key={i} className="bar-row">
                  <span className="bar-label">{g.label}</span>
                  <div className="bar-track">
                    <div 
                      className="bar-fill" 
                      style={{ 
                        width: `${(g.total / Math.max(...stats.byGroup.map(x => x.total))) * 100}%`,
                        background: `linear-gradient(90deg, ${cores[i % cores.length]}, ${cores[(i+1) % cores.length]})`
                      }} 
                    />
                  </div>
                  <span className="bar-value">{g.total}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Gráfico de Evolução Semanal */}
          <LineChart data={stats.weeklyData} />

          {/* METAS */}
          <div className="section">
            <div className="section-header">
              <h2 className="section-title">🎯 Minhas Metas</h2>
              <button className="section-action" onClick={() => setShowMetaModal(true)}>+ Nova</button>
            </div>

            {metas.length === 0 ? (
              <p className="empty-metas">Nenhuma meta criada ainda</p>
            ) : (
              <div className="metas-list">
                {metas.map(meta => {
                  const { count, percentage } = calcularProgressoMeta(meta);
                  return (
                    <div key={meta.id} className="meta-card">
                      <div className="meta-header">
                        <div className="meta-info">
                          <h4>{meta.subdivisao || meta.tipo}</h4>
                          <span className="meta-deadline">
                            {meta.dataLimite ? `Até ${formatDate(meta.dataLimite)}` : "Sem prazo"}
                          </span>
                        </div>
                        <span className="meta-percentage">{percentage.toFixed(0)}%</span>
                      </div>
                      <div className="meta-progress">
                        <div className="meta-progress-fill" style={{ width: `${percentage}%` }} />
                      </div>
                      <div className="meta-footer">
                        <span className="meta-count">{count} / {meta.quantidade}</span>
                        <button className="meta-delete" onClick={() => handleExcluirMeta(meta.id)}>🗑️</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* CURVA DE APRENDIZADO COM HISTÓRICO */}
          <div className="section">
            <div className="section-header">
              <h2 className="section-title">📈 Curva de Aprendizado</h2>
            </div>
            <p className="section-desc">Clique em cada item para ver o histórico completo</p>

            {stats.byGroup.map((group, idx) => (
              <GrupoCard 
                key={group.label} 
                group={group} 
                onExcluir={handleExcluir}
                excluindo={excluindo}
                cores={cores}
                index={idx}
              />
            ))}
          </div>
        </>
      )}

      {/* MODAL NOVA META */}
      {showMetaModal && (
        <div className="modal-overlay" onClick={() => setShowMetaModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">🎯 Nova Meta</h3>
            
            <div className="modal-field">
              <label className="modal-label">Tipo</label>
              <select 
                className="modal-select" 
                value={novaMeta.tipo}
                onChange={e => setNovaMeta({ ...novaMeta, tipo: e.target.value, subdivisao: "" })}
              >
                <option value="">Selecione...</option>
                {tiposDisponiveis.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="modal-field">
              <label className="modal-label">Subdivisão (opcional)</label>
              <select 
                className="modal-select" 
                value={novaMeta.subdivisao}
                onChange={e => setNovaMeta({ ...novaMeta, subdivisao: e.target.value })}
                disabled={!novaMeta.tipo}
              >
                <option value="">Todas</option>
                {(subdivisoesDisponiveis[novaMeta.tipo] || []).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="modal-row">
              <div className="modal-field">
                <label className="modal-label">Quantidade</label>
                <input 
                  type="number" 
                  className="modal-input"
                  value={novaMeta.quantidade}
                  onChange={e => setNovaMeta({ ...novaMeta, quantidade: parseInt(e.target.value) || 0 })}
                  min="1"
                />
              </div>
              <div className="modal-field">
                <label className="modal-label">Data Limite</label>
                <input 
                  type="date" 
                  className="modal-input"
                  value={novaMeta.dataLimite}
                  onChange={e => setNovaMeta({ ...novaMeta, dataLimite: e.target.value })}
                />
              </div>
            </div>

            <div className="modal-buttons">
              <button className="modal-btn cancelar" onClick={() => setShowMetaModal(false)}>Cancelar</button>
              <button className="modal-btn confirmar" onClick={handleSalvarMeta}>Criar Meta</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
