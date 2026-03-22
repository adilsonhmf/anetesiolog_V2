import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { RegistrarProcedimento } from './components/RegistrarProcedimento';
import { NavBar } from './components/NavBar';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Tela de carregamento
  if (loading) {
    return (
      <div className="app">
        <div className="loading-screen">
          <span className="loading-icon">🩺</span>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  // Se NÃO está logado, mostra tela de Login
  if (!user) {
    return (
      <div className="app">
        <Login />
      </div>
    );
  }

  // Se está logado, mostra o app normal
  return (
    <div className="app">
      {currentPage === 'dashboard' && <Dashboard />}
      {currentPage === 'registrar' && <RegistrarProcedimento />}
      {currentPage === 'metas' && (
        <div className="metas-container">
          <h2>🎯 Metas</h2>
          <p>Em breve!</p>
          <p style={{ color: '#8b8b9e', fontSize: '14px', marginTop: '20px' }}>
            Logado como: {user.email}
          </p>
          <button 
            className="logout-btn" 
            onClick={() => signOut(auth)}
          >
            Sair da conta
          </button>
        </div>
      )}
      
      <NavBar currentPage={currentPage} setCurrentPage={setCurrentPage} />
    </div>
  );
}

export default App;
