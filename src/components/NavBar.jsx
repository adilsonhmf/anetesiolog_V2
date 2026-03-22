import React from 'react';
import './NavBar.css';

export function NavBar({ currentPage, setCurrentPage }) {
  const navItems = [
    { id: 'dashboard', icon: '📊', label: 'Dash' },
    { id: 'tarefas', icon: '📋', label: 'Tarefas' },
    { id: 'registrar', icon: '➕', label: 'Registrar', isMain: true },
    { id: 'agenda', icon: '📅', label: 'Agenda' },
    { id: 'notas', icon: '✏️', label: 'Notas' },
  ];

  return (
    <nav className="navbar">
      {navItems.map(item => (
        <button
          key={item.id}
          className={`nav-btn ${currentPage === item.id ? 'active' : ''} ${item.isMain ? 'main' : ''}`}
          onClick={() => setCurrentPage(item.id)}
        >
          <span className={`nav-icon ${item.isMain ? 'main-icon' : ''}`}>{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
