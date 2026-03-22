import React, { useState, useEffect } from "react";
import { buscarProcedimentos, excluirProcedimento, buscarConfiguracoes } from "../firestoreService";
import { auth } from "../firebase";
import "./Dashboard.css";

function getSuccessColor(rate) {
  if (rate >= 80) return "green";
  if (rate >= 60) return "yellow";
  return "red";
}

function calcularStreak(procedimentos, subdivisao) {
  const procs = procedimentos
    .filter(p => (p.procedimento || p.subdivisao) === subdivisao && p.sucesso)
    .sort((a, b) => new Date(b.data) - new Date(a.data));
  
  let streak = 0;
  for (const proc of procs) {
    const allProcs = procedimentos.filter(p => (p.procedimento || p.subdivisao) === subdivisao);
    const idx = allProcs.findIndex(p => p.id === proc.id);
    if (idx === streak) streak++;
    else break;
  }
  return streak;
}

function calcularEstatisticas(procedimentos) {
  const total = procedimentos.length;
  const successes = procedimentos.filter(p => p.sucesso).length;
  const successRate = total > 0 ? (successes / total) * 100 : 0;

  // Este mês
  const hoje = new Date();
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const esteMes = procedimentos.filter(p => new Date(p.data) >= inicioMes).length;

  // Recorde (maior número em um dia)
  const porDia = {};
  procedimentos.forEach(p => {
    porDia[p.data] = (porDia[p.data] || 0) + 1;
  });
  const recorde = Math.max(0, ...Object.values(porDia));

  // Agrupar por tipo
  const grupos = {};
  procedimentos.forEach(p => {
    const tipo = p.categoria || p.tipo || "Outros";
    const proc = p.procedimento || p.subdivisao || "Desconhecido";
    if (!grupos[tipo]) grupos[tipo] = { items: {}, total: 0, successes: 0 };
    if (!grupos[tipo].items[proc]) grupos[tipo].items[proc] = { total: 0, successes: 0 };
    grupos[tipo].items[proc].total++;
    grupos[tipo].total++;
    if (p.sucesso) {
      grupos[tipo].items[proc].successes++;
      grupos[tipo].successes++;
    }
  });

  const byGroup = Object.entries(grupos).map(([label, data]) => ({
    label,
    total: data.total,
    successes: data.successes,
    rate: data.total > 0 ? (data.successes / data.total) * 100 : 0,
    items: Object.entries(data.items).map(([name, d]) => ({
      name,
      total: d.total,
      successes: d.successes,
      rate: d.total > 0 ? (d.successes / d.total) * 100 : 0,
      streak: calcularStreak(procedimentos, name)
    }))
  }));

  return { total, successes, successRate, esteMes, recorde, byGroup };
}

export function Dashboard() {
  const [stats, setStats] = useState({ total: 0, successes: 0, successRate: 0, esteMes: 0, recorde: 0, byGroup: [] });
  const [procedimentos, setProcedimentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [excluindo, setExcluindo] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [filtroTag, setFiltroTag] = useState(null);
  
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

  const toggleGroup = (label) => {
    setExpandedGroups(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const handleExcluir = async (proc) => {
    if (!window.confirm(`Excluir "${proc.procedimento || proc.subdivisao}"?`)) return;
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

  const handleTagClick = (tag) => {
    setFiltroTag(filtroTag === tag ? null : tag);
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : "";

  const procedimentosFiltrados = filtroTag 
    ? procedimentos.filter(p => p.tags?.includes(filtroTag))
    : procedimentos;

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

      {/* Stats - 4 itens FIXOS */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <p className="stat-value">{stats.total}</p>
          <p className="stat-label">Total</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <p className="stat-value green">{stats.successRate.toFixed(0)}%</p>
          <p className="stat-label">Sucesso</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <p className="stat-value blue">{stats.esteMes}</p>
          <p className="stat-label">Este Mês</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <p className="stat-value yellow">{stats.recorde}</p>
          <p className="stat-label">Recorde</p>
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
          {/* METAS */}
          <div className="section">
            <div className="section-header">
              <div>
                <h2 className="section-title">🎯 Minhas Metas</h2>
                <p className="section-desc">Acompanhe seu progresso</p>
              </div>
              <button className="section-action" onClick={() => setShowMetaModal(true)}>+ Nova</button>
            </div>

            {metas.length === 0 ? (
              <p className="empty-metas">Nenhuma meta criada. Clique em "+ Nova"!</p>
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

          {/* CURVA DE APRENDIZADO */}
          <div className="section">
            <div className="section-header">
              <div>
                <h2 className="section-title">📈 Curva de Aprendizado</h2>
                <p className="section-desc">Taxa de sucesso + streak por procedimento</p>
              </div>
            </div>

            {stats.byGroup.map((group, idx) => (
              <div key={group.label} className="learning-card">
                <div className="learning-header" onClick={() => toggleGroup(group.label)}>
                  <div className="learning-left">
                    <div className="learning-icon" style={{ background: `linear-gradient(135deg, ${cores[idx % cores.length]}33, ${cores[idx % cores.length]}11)` }}>
                      📊
                    </div>
                    <div className="learning-info">
                      <h3>{group.label}</h3>
                      <span className="learning-meta">{group.total} proc · {group.successes} sucessos</span>
                    </div>
                  </div>
                  <div className="learning-right">
                    <span className={`learning-rate ${getSuccessColor(group.rate)}`}>
                      {group.rate.toFixed(0)}%
                    </span>
                    <span className="chevron">{expandedGroups[group.label] ? "▲" : "▼"}</span>
                  </div>
                </div>

                {expandedGroups[group.label] && (
                  <div className="learning-body">
                    {group.items.map((item, i) => (
                      <div key={i} className="sub-item">
                        <div className="sub-info">
                          <h4>{item.name}</h4>
                          <span className="sub-meta">
                            {item.total} proc · {item.successes} suc.
                            {item.streak > 0 && <span className="sub-streak">🔥 {item.streak}</span>}
                          </span>
                        </div>
                        <div className="sub-stats">
                          <div className="mini-progress">
                            <div 
                              className="mini-progress-fill" 
                              style={{ 
                                width: `${item.rate}%`,
                                background: item.rate >= 80 ? '#10b981' : item.rate >= 60 ? '#f59e0b' : '#ef4444'
                              }} 
                            />
                          </div>
                          <span className="sub-rate" style={{ color: item.rate >= 80 ? '#10b981' : item.rate >= 60 ? '#f59e0b' : '#ef4444' }}>
                            {item.rate.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* GRÁFICO */}
          <div className="section">
            <div className="chart-card">
              <h3 className="chart-title">📊 Procedimentos por Tipo</h3>
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
          </div>

          {/* ÚLTIMOS REGISTROS */}
          <div className="section">
            <div className="section-header">
              <h2 className="section-title">📝 Últimos Registros</h2>
            </div>

            {filtroTag && (
              <div className="filter-active">
                <span className="filter-text">Filtrando por: "{filtroTag}"</span>
                <button className="filter-clear" onClick={() => setFiltroTag(null)}>×</button>
              </div>
            )}

            <div className="history-list">
              {procedimentosFiltrados.slice(0, 8).map((proc, idx) => (
                <div key={proc.id} className="history-item">
                  <div className="history-left">
                    <span className={`history-status ${proc.sucesso ? 'success' : 'fail'}`}>
                      {proc.sucesso ? '✓' : '✗'}
                    </span>
                    <div className="history-info">
                      <span className="history-proc">{proc.procedimento || proc.subdivisao}</span>
                      <span className="history-meta">{proc.categoria || proc.tipo} · {proc.tentativas || 1} tent.</span>
                      {proc.tags?.length > 0 && (
                        <div className="history-tags">
                          {proc.tags.map((tag, i) => (
                            <span 
                              key={i} 
                              className={`history-tag tag-${i % 6}`}
                              onClick={() => handleTagClick(tag)}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="history-right">
                    <span className="history-date">{formatDate(proc.data)}</span>
                    <button className="delete-btn" onClick={() => handleExcluir(proc)} disabled={excluindo === proc.id}>
                      {excluindo === proc.id ? '...' : '🗑️'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
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
