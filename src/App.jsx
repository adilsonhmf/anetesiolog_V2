import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { RegistrarProcedimento } from './components/RegistrarProcedimento';
import { Tarefas } from './components/Tarefas';
import { Notas } from './components/Notas';
import { Agenda } from './components/Agenda';
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

  if (!user) {
    return (
      <div className="app">
        <Login />
      </div>
    );
  }

  return (
    <div className="app">
      {currentPage === 'dashboard' && <Dashboard />}
      {currentPage === 'registrar' && <RegistrarProcedimento />}
      {currentPage === 'tarefas' && <Tarefas />}
      {currentPage === 'notas' && <Notas />}
      {currentPage === 'agenda' && <Agenda />}
      
      <NavBar currentPage={currentPage} setCurrentPage={setCurrentPage} />
    </div>
  );
}

export default App;
