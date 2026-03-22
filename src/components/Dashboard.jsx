import React, { useState, useEffect } from 'react';
import { buscarProcedimentos } from '../firestoreService';
import { auth } from '../firebase';
import './Dashboard.css';

export function Dashboard() {
  const [procedimentos, setProcedimentos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarProcedimentos();
  }, []);

  const carregarProcedimentos = async () => {
    try {
      const userId = auth.currentUser.uid;
      const dados = await buscarProcedimentos(userId);
      setProcedimentos(dados);
    } catch (error) {
      console.error("Erro ao carregar:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalProcedimentos = procedimentos.length;
  const totalSucessos = procedimentos.filter(p => p.sucesso).length;

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Carregando dados da nuvem... ☁️</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <p className="welcome-text">Bem-vindo de volta</p>
        <h1 className="app-title">AnestesioLOG</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card chart-card">
          <div className="chart-placeholder">
            <div className="chart-circle">
              <span className="chart-value">{totalSucessos}</span>
              <span className="chart-label">SUCESSO</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon">📋</span>
          <span className="stat-label">TOTAL</span>
          <span className="stat-value">{totalProcedimentos}</span>
        </div>

        <div className="stat-card">
          <span className="stat-icon">✅</span>
          <span className="stat-label">SUCESSOS</span>
          <span className="stat-value success">{totalSucessos}</span>
        </div>
      </div>

      <div className="recent-section">
        {procedimentos.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📝</span>
            <h3>Nenhum procedimento</h3>
            <p>Clique em <strong>Registrar</strong> para começar!</p>
          </div>
        ) : (
          <>
            <h2 className="section-title">Procedimentos Recentes</h2>
            <div className="procedures-list">
              {procedimentos.slice(0, 5).map((proc) => (
                <div key={proc.id} className="procedure-item">
                  <div className="procedure-info">
                    <span className="procedure-type">{proc.tipo}</span>
                    <span className="procedure-date">{proc.data}</span>
                  </div>
                  <span className="procedure-status">✅</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
