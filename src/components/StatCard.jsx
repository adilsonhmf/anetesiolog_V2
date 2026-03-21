import React from "react";
import "./StatCard.css";

export function StatCard({ label, value, subtitle, accentColor, icon }) {
  return (
    <div className="stat-card">
      <div className="stat-card-top-row">
        {icon && <div className="stat-card-icon">{icon}</div>}
        <span className="stat-card-label">{label}</span>
      </div>
      <span 
        className="stat-card-value" 
        style={{ color: accentColor || "#007AFF" }}
      >
        {value}
      </span>
      {subtitle && (
        <span className="stat-card-subtitle">{subtitle}</span>
      )}
    </div>
  );
}
