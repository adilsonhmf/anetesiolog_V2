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
    backgroundColor: '#ffffff',
    borderTop: '2px solid #007AFF',
    padding: '12px 0 20px 0',
    zIndex: 9999,
  };

  const btnStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '12px',
    color: '#666',
  };

  const activeStyle = {
    ...btnStyle,
    color: '#007AFF',
    fontWeight: 'bold',
  };

  return (
    <div className="app">
      {currentPage === 'dashboard' && <Dashboard />}
      {currentPage === 'registrar' && <RegistrarProcedimento />}
      {currentPage === 'metas' && (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>🎯 Metas</h2>
          <p>Em breve!</p>
        </div>
      )}

      <nav style={navStyle}>
        <button
          style={currentPage === 'dashboard' ? activeStyle : btnStyle}
          onClick={() => setCurrentPage('dashboard')}
        >
          <span style={{ fontSize: '24px' }}>📊</span>
          <span>Dashboard</span>
        </button>

        <button
          style={currentPage === 'registrar' ? activeStyle : btnStyle}
          onClick={() => setCurrentPage('registrar')}
        >
          <span style={{ fontSize: '24px' }}>➕</span>
          <span>Registrar</span>
        </button>

        <button
          style={currentPage === 'metas' ? activeStyle : btnStyle}
          onClick={() => setCurrentPage('metas')}
        >
          <span style={{ fontSize: '24px' }}>🎯</span>
          <span>Metas</span>
        </button>
      </nav>
    </div>
  );
}

export default App;
