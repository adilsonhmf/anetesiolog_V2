import React, { useState, useEffect } from "react";
import { signInWithPopup, signInWithRedirect, getRedirectResult } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import "./Login.css";

export function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Verifica se voltou de um redirect
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          console.log("Login OK:", result.user.email);
        }
      })
      .catch((err) => {
        console.error("Erro redirect:", err);
        if (err.code !== 'auth/popup-closed-by-user') {
          setError("Erro: " + err.message);
        }
      });
  }, []);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Tenta popup primeiro
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error("Erro popup:", err.code, err.message);
      
      // Se popup falhar, tenta redirect
      if (err.code === 'auth/popup-blocked' || 
          err.code === 'auth/popup-closed-by-user' ||
          err.code === 'auth/cancelled-popup-request') {
        try {
          await signInWithRedirect(auth, googleProvider);
        } catch (redirectErr) {
          setError("Erro ao fazer login: " + redirectErr.message);
        }
      } else {
        setError("Erro ao fazer login: " + err.message);
      }
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <span className="login-icon">🩺</span>
          <h1 className="login-title">AnestesioLOG</h1>
          <p className="login-subtitle">Registro de procedimentos anestésicos</p>
        </div>

        <div className="login-features">
          <div className="feature">
            <span>📊</span>
            <span>Acompanhe sua evolução</span>
          </div>
          <div className="feature">
            <span>☁️</span>
            <span>Dados salvos na nuvem</span>
          </div>
          <div className="feature">
            <span>📱</span>
            <span>Acesse de qualquer dispositivo</span>
          </div>
        </div>

        {error && <p className="login-error">{error}</p>}

        <button 
          className="google-btn"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          {loading ? (
            <span>Entrando...</span>
          ) : (
            <>
              <svg className="google-icon" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Entrar com Google</span>
            </>
          )}
        </button>

        <p className="login-disclaimer">
          Seus dados são armazenados de forma segura e privada.
        </p>
      </div>
    </div>
  );
}
