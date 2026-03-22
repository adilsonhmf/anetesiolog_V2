import { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { RegistrarProcedimento } from './components/RegistrarProcedimento';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const navStyle = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'space-around',
    background: 'linear-gradient(180deg, #16162a 0%, #0a0a0f 100%)',
    borderTop: '1px solid #2a2a3e',
    padding: '12px 0 24px 0',
    zIndex: 9999
  };

  const btnStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '11px',
    color: '#8b8b9e',
    transition: 'all 0.2s'
  };

  const activeStyle = {
    ...btnStyle,
    color: '#10b981'
  };

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
      
      <nav style={navStyle}>
        <button 
          style={currentPage === 'dashboard' ? activeStyle : btnStyle}
          onClick={() => setCurrentPage('dashboard')}
        >
          <span style={{fontSize: '24px'}}>📊</span>
          <span>Dashboard</span>
        </button>
        
        <button 
          style={currentPage === 'registrar' ? activeStyle : btnStyle}
          onClick={() => setCurrentPage('registrar')}
        >
          <span style={{fontSize: '24px'}}>➕</span>
          <span>Registrar</span>
        </button>
        
        <button 
          style={currentPage === 'metas' ? activeStyle : btnStyle}
          onClick={() => setCurrentPage('metas')}
        >
          <span style={{fontSize: '24px'}}>🎯</span>
          <span>Metas</span>
        </button>
      </nav>
    </div>
  );
}

export default App;
