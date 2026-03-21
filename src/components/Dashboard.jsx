import React, { useState, useEffect } from "react";
import { StatCard } from "./StatCard";
import { useTheme } from "../hooks/useTheme";
import { calcularEstatisticas } from "../data/mockData";
import "./Dashboard.css";

function getSuccessColor(rate, total) {
  if (total === 0) return "#666666";
  if (rate >= 80) return "#22c55e";
  if (rate >= 60) return "#f59e0b";
  return "#ef4444";
}

function ProcedureItemRow({ label, total, successes, successRate }) {
  const rateColor = getSuccessColor(successRate, total);
  const barWidth = total > 0 ? Math.max(successRate, 2) : 0;

  return (
    <div className="procedure-row">
      <div className="procedure-label-col">
        <span className={`procedure-label ${total === 0 ? 'muted' : ''}`}>
          {label}
        </span>
        {total > 0 ? (
          <span className="procedure-meta">
            {total} proc · {successes} sucesso{successes !== 1 ? "s" : ""}
          </span>
        ) : (
          <span className="procedure-meta">Sem registros</span>
        )}
      </div>
      <div className="procedure-rate-col">
        {total > 0 ? (
          <>
            <span className="procedure-rate" style={{ color: rateColor }}>
              {successRate.toFixed(0)}%
            </span>
            <div className="mini-track">
              <div 
                className="mini-fill" 
                style={{ width: `${barWidth}%`, backgroundColor: rateColor }}
              />
            </div>
          </>
        ) : (
          <span className="rate-dash">—</span>
        )}
      </div>
    </div>
  );
}

function ProcedureGroupCard({ group }) {
  const [expanded, setExpanded] = useState(true);
  
  const groupTotal = group.items.reduce((s, i) => s + i.total, 0);
  const groupSuccesses = group.items.reduce((s, i) => s + i.successes, 0);
  const groupRate = groupTotal > 0 ? (groupSuccesses / groupTotal) * 100 : 0;

  const categoryColors = {
    via_aerea: "#007AFF",
    regional: "#8b5cf6",
    acesso: "#06b6d4"
  };

  const groupColor = categoryColors[group.category] || "#007AFF";
  const rateColor = getSuccessColor(groupRate, groupTotal);

  return (
    <div className="group-card">
      <div className="group-header" onClick={() => setExpanded(!expanded)}>
        <div className="group-dot" style={{ backgroundColor: groupColor }} />
        <div className="group-info">
          <span className="group-label">{group.groupLabel}</span>
          <span className="group-meta">
            {groupTotal > 0 
              ? `${groupTotal} procedimento${groupTotal !== 1 ? "s" : ""} · ${groupRate.toFixed(0)}% sucesso`
              : "Nenhum registro ainda"
            }
          </span>
        </div>
        <div className="group-right">
          {groupTotal > 0 && (
            <div className="rate-pill" style={{ backgroundColor: `${rateColor}22` }}>
              <span style={{ color: rateColor }}>{groupRate.toFixed(0)}%</span>
            </div>
          )}
          <span className="chevron">{expanded ? "▲" : "▼"}</span>
        </div>
      </div>

      {expanded && group.items.length > 0 && (
        <div className="group-body">
          {group.items.map((item, idx) => (
            <React.Fragment key={item.label}>
              <ProcedureItemRow
                label={item.label}
                total={item.total}
                successes={item.successes}
                successRate={item.successRate}
              />
              {idx < group.items.length - 1 && <div className="divider" />}
            </React.Fragment>
          ))}
        </div>
      )}

      {expanded && group.items.length === 0 && (
        <div className="group-body empty">
          <p className="empty-text">Nenhum procedimento registrado nesta categoria.</p>
        </div>
      )}
    </div>
  );
}

export function Dashboard() {
  const { colors } = useTheme();
  const [summary, setSummary] = useState(calcularEstatisticas());

  // Atualiza quando a página ganha foco (usuário volta da tela de registrar)
  useEffect(() => {
    const handleFocus = () => {
      setSummary(calcularEstatisticas());
    };

    window.addEventListener('focus', handleFocus);
    
    // Também atualiza a cada 2 segundos (para pegar novos registros)
    const interval = setInterval(() => {
      setSummary(calcularEstatisticas());
    }, 2000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="dashboard">
      <div className="header-row">
        <div>
          <p className="greeting">Bem-vindo de volta</p>
          <h1 className="title">AnestesioLog</h1>
        </div>
        <div className="avatar-circle">
          <span>🩺</span>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          label="Total de Procedimentos"
          value={summary.total}
          accentColor={colors.tint}
          icon="📋"
        />
        <StatCard
          label="Taxa de Sucesso Geral"
          value={summary.total > 0 ? `${summary.successRate.toFixed(1)}%` : "—"}
          accentColor={summary.total > 0 ? getSuccessColor(summary.successRate, summary.total) : "#666"}
          icon="📈"
        />
      </div>

      {summary.total === 0 && (
        <div className="empty-state">
          <span className="empty-icon">📝</span>
          <h3>Nenhum procedimento registrado</h3>
          <p>Clique em <strong>Registrar</strong> para adicionar seu primeiro procedimento!</p>
        </div>
      )}

      <div className="section">
        <h2 className="section-title">Curva de Aprendizado</h2>
        <p className="section-desc">Taxa de sucesso por procedimento</p>

        {summary.byProcedureGroup.map((group) => (
          <ProcedureGroupCard key={group.groupLabel} group={group} />
        ))}
      </div>

      {summary.failureProcedures && summary.failureProcedures.length > 0 && (
        <div className="section">
          <h2 className="section-title">⚠️ Focar Treinamento</h2>
          <p className="section-desc">Procedimentos com menor taxa de sucesso</p>
          
          {summary.failureProcedures.map((p, i) => (
            <div key={i} className="focus-row">
              <div className="rank-badge">⚠️</div>
              <div className="rank-info">
                <span className="rank-type">
                  {p.type}{p.subtype ? ` · ${p.subtype}` : ""}
                </span>
                <span className="rank-meta">
                  {p.successRate.toFixed(0)}% sucesso em {p.total} procedimento{p.total !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="focus-rate-pill">
                <span>{p.successRate.toFixed(0)}%</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
