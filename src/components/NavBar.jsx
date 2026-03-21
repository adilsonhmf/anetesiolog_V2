import React from 'react';
import './NavBar.css';

export function NavBar({ currentPage, onChangePage }) {
  return (
    <nav className="navbar">
      <button
        className={`nav-item ${currentPage === 'dashboard' ? 'active' : ''}`}
        onClick={() => onChangePage('dashboard')}
      >
        <span className="nav-icon">📊</span>
        <span className="nav-label">Dashboard</span>
      </button>

      <button
        className={`nav-item ${currentPage === 'registrar' ? 'active' : ''}`}
        onClick={() => onChangePage('registrar')}
      >
        <span className="nav-icon">➕</span>
        <span className="nav-label">Registrar</span>
      </button>

      <button
        className={`nav-item ${currentPage === 'metas' ? 'active' : ''}`}
        onClick={() => onChangePage('metas')}
      >
        <span className="nav-icon">🎯</span>
        <span className="nav-label">Metas</span>
      </button>
    </nav>
  );
}
