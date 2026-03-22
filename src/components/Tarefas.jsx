import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import './Tarefas.css';

export function Tarefas() {
  const [tarefas, setTarefas] = useState([]);
  const [novaTarefa, setNovaTarefa] = useState('');
  const [filtro, setFiltro] = useState('todas');

  useEffect(() => {
    carregarTarefas();
  }, []);

  const carregarTarefas = () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    const salvas = JSON.parse(localStorage.getItem(`tarefas_${userId}`) || '[]');
    setTarefas(salvas);
  };

  const salvarTarefas = (novasTarefas) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    localStorage.setItem(`tarefas_${userId}`, JSON.stringify(novasTarefas));
    setTarefas(novasTarefas);
  };

  const handleAdicionar = (e) => {
    e.preventDefault();
    if (!novaTarefa.trim()) return;

    const nova = {
      id: Date.now(),
      texto: novaTarefa.trim(),
      concluida: false,
      criadaEm: new Date().toISOString(),
      prioridade: 'normal'
    };

    salvarTarefas([nova, ...tarefas]);
    setNovaTarefa('');
  };

  const handleToggle = (id) => {
    const atualizadas = tarefas.map(t => 
      t.id === id ? { ...t, concluida: !t.concluida } : t
    );
    salvarTarefas(atualizadas);
  };

  const handleExcluir = (id) => {
    salvarTarefas(tarefas.filter(t => t.id !== id));
  };

  const handlePrioridade = (id) => {
    const prioridades = ['normal', 'alta', 'urgente'];
    const atualizadas = tarefas.map(t => {
      if (t.id === id) {
        const idx = prioridades.indexOf(t.prioridade);
        const novaPrioridade = prioridades[(idx + 1) % prioridades.length];
        return { ...t, prioridade: novaPrioridade };
      }
      return t;
    });
    salvarTarefas(atualizadas);
  };

  const tarefasFiltradas = tarefas.filter(t => {
    if (filtro === 'pendentes') return !t.concluida;
    if (filtro === 'concluidas') return t.concluida;
    return true;
  });

  const pendentes = tarefas.filter(t => !t.concluida).length;
  const concluidas = tarefas.filter(t => t.concluida).length;

  return (
    <div className="tarefas-container">
      <div className="tarefas-header">
        <h1 className="tarefas-title">📋 Tarefas</h1>
        <p className="tarefas-subtitle">Organize seus estudos e atividades</p>
      </div>

      {/* Stats */}
      <div className="tarefas-stats">
        <div className="tarefa-stat">
          <span className="tarefa-stat-value">{pendentes}</span>
          <span className="tarefa-stat-label">Pendentes</span>
        </div>
        <div className="tarefa-stat">
          <span className="tarefa-stat-value green">{concluidas}</span>
          <span className="tarefa-stat-label">Concluídas</span>
        </div>
      </div>

      {/* Formulário */}
      <form onSubmit={handleAdicionar} className="tarefa-form">
        <input
          type="text"
          className="tarefa-input"
          placeholder="Nova tarefa... (ex: Estudar IOT)"
          value={novaTarefa}
          onChange={(e) => setNovaTarefa(e.target.value)}
        />
        <button type="submit" className="tarefa-add-btn">+</button>
      </form>

      {/* Filtros */}
      <div className="tarefas-filtros">
        <button 
          className={`filtro-btn ${filtro === 'todas' ? 'active' : ''}`}
          onClick={() => setFiltro('todas')}
        >
          Todas
        </button>
        <button 
          className={`filtro-btn ${filtro === 'pendentes' ? 'active' : ''}`}
          onClick={() => setFiltro('pendentes')}
        >
          Pendentes
        </button>
        <button 
          className={`filtro-btn ${filtro === 'concluidas' ? 'active' : ''}`}
          onClick={() => setFiltro('concluidas')}
        >
          Concluídas
        </button>
      </div>

      {/* Lista */}
      <div className="tarefas-lista">
        {tarefasFiltradas.length === 0 ? (
          <div className="tarefas-empty">
            <span>✨</span>
            <p>{filtro === 'todas' ? 'Nenhuma tarefa ainda' : `Nenhuma tarefa ${filtro}`}</p>
          </div>
        ) : (
          tarefasFiltradas.map(tarefa => (
            <div key={tarefa.id} className={`tarefa-item ${tarefa.concluida ? 'concluida' : ''} prioridade-${tarefa.prioridade}`}>
              <button 
                className={`tarefa-check ${tarefa.concluida ? 'checked' : ''}`}
                onClick={() => handleToggle(tarefa.id)}
              >
                {tarefa.concluida ? '✓' : ''}
              </button>
              <div className="tarefa-content">
                <span className="tarefa-texto">{tarefa.texto}</span>
                <span className="tarefa-data">
                  {new Date(tarefa.criadaEm).toLocaleDateString('pt-BR')}
                </span>
              </div>
              <div className="tarefa-actions">
                <button 
                  className={`prioridade-btn ${tarefa.prioridade}`}
                  onClick={() => handlePrioridade(tarefa.id)}
                  title="Alterar prioridade"
                >
                  {tarefa.prioridade === 'urgente' ? '🔴' : tarefa.prioridade === 'alta' ? '🟡' : '🟢'}
                </button>
                <button 
                  className="tarefa-delete"
                  onClick={() => handleExcluir(tarefa.id)}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
