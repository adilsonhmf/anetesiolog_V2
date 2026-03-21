import { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { RegistrarProcedimento } from './components/RegistrarProcedimento';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  return (
    <div className="app">
      {currentPage === 'dashboard' && <Dashboard />}
      {currentPage === 'registrar' && <RegistrarProcedimento />}
      {currentPage === 'metas' && (
        <div className="coming-soon">
          <h2>🎯 Metas</h2>
          <p>Em breve!</p>
        </div>
      )}
      
      <nav className="navbar">
        <button 
          className={`nav-btn ${currentPage === 'dashboard' ? 'active' : ''}`}
          onClick={() => setCurrentPage('dashboard')}
        >
          <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="7" height="7" rx="1"/>
          </svg>
          <span>Dashboard</span>
        </button>
        
        <button 
          className={`nav-btn ${currentPage === 'registrar' ? 'active' : ''}`}
          onClick={() => setCurrentPage('registrar')}
        >
          <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="16"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
          <span>Registrar</span>
        </button>
        
        <button 
          className={`nav-btn ${currentPage === 'metas' ? 'active' : ''}`}
          onClick={() => setCurrentPage('metas')}
        >
          <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <circle cx="12" cy="12" r="6"/>
            <circle cx="12" cy="12" r="2"/>
          </svg>
          <span>Metas</span>
        </button>
      </nav>
    </div>
  );
}

export default App;
