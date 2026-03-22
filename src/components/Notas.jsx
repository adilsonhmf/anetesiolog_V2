import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import './Notas.css';

export function Notas() {
  const [notas, setNotas] = useState([]);
  const [notaAtiva, setNotaAtiva] = useState(null);
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');

  useEffect(() => {
    carregarNotas();
  }, []);

  const carregarNotas = () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    const salvas = JSON.parse(localStorage.getItem(`notas_${userId}`) || '[]');
    setNotas(salvas);
  };

  const salvarNotas = (novasNotas) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    localStorage.setItem(`notas_${userId}`, JSON.stringify(novasNotas));
    setNotas(novasNotas);
  };

  const handleNovaNota = () => {
    const nova = {
      id: Date.now(),
      titulo: 'Nova nota',
      conteudo: '',
      criadaEm: new Date().toISOString(),
      atualizadaEm: new Date().toISOString()
    };
    const novasNotas = [nova, ...notas];
    salvarNotas(novasNotas);
    // Abre direto para edição
    setNotaAtiva(nova);
    setTitulo(nova.titulo);
    setConteudo(nova.conteudo);
  };
  
  const handleVoltar = () => {
    // Salva antes de voltar
    if (notaAtiva && (titulo || conteudo)) {
      const atualizadas = notas.map(n => 
        n.id === notaAtiva.id 
          ? { ...n, titulo, conteudo, atualizadaEm: new Date().toISOString() }
          : n
      );
      salvarNotas(atualizadas);
    }
    setNotaAtiva(null);
    setTitulo('');
    setConteudo('');
  };
  

  const handleSelecionarNota = (nota) => {
    setNotaAtiva(nota);
    setTitulo(nota.titulo);
    setConteudo(nota.conteudo);
  };

  const handleSalvar = () => {
    if (!notaAtiva) return;
    const atualizadas = notas.map(n => 
      n.id === notaAtiva.id 
        ? { ...n, titulo, conteudo, atualizadaEm: new Date().toISOString() }
        : n
    );
    salvarNotas(atualizadas);
  };

  const handleExcluir = (id) => {
    if (!window.confirm('Excluir esta nota?')) return;
    salvarNotas(notas.filter(n => n.id !== id));
    if (notaAtiva?.id === id) {
      setNotaAtiva(null);
      setTitulo('');
      setConteudo('');
    }
  };

  const handleVoltar = () => {
    handleSalvar();
    setNotaAtiva(null);
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('pt-BR', { 
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' 
  });

  // Tela de edição
  if (notaAtiva) {
    return (
      <div className="notas-container">
        <div className="nota-editor-header">
          <button className="nota-voltar" onClick={handleVoltar}>← Voltar</button>
          <button className="nota-salvar" onClick={() => { handleSalvar(); handleVoltar(); }}>💾 Salvar</button>
        </div>
        <input
          type="text"
          className="nota-titulo-input"
          placeholder="Título da nota"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          onBlur={handleSalvar}
        />
        <textarea
          className="nota-conteudo-input"
          placeholder="Escreva sua anotação aqui..."
          value={conteudo}
          onChange={(e) => setConteudo(e.target.value)}
          onBlur={handleSalvar}
        />
      </div>
    );
  }

  // Lista de notas
  return (
    <div className="notas-container">
      <div className="notas-header">
        <div>
          <h1 className="notas-title">✏️ Notas</h1>
          <p className="notas-subtitle">Anotações rápidas</p>
        </div>
        <button className="nova-nota-btn" onClick={handleNovaNota}>+ Nova</button>
      </div>

      <div className="notas-lista">
        {notas.length === 0 ? (
          <div className="notas-empty">
            <span>📝</span>
            <p>Nenhuma nota ainda</p>
            <button className="criar-nota-btn" onClick={handleNovaNota}>Criar primeira nota</button>
          </div>
        ) : (
          notas.map(nota => (
            <div 
              key={nota.id} 
              className="nota-card"
              onClick={() => handleSelecionarNota(nota)}
            >
              <div className="nota-card-content">
                <h3 className="nota-card-titulo">{nota.titulo || 'Sem título'}</h3>
                <p className="nota-card-preview">
                  {nota.conteudo?.substring(0, 60) || 'Nota vazia...'}
                  {nota.conteudo?.length > 60 ? '...' : ''}
                </p>
                <span className="nota-card-data">{formatDate(nota.atualizadaEm)}</span>
              </div>
              <button 
                className="nota-card-delete"
                onClick={(e) => { e.stopPropagation(); handleExcluir(nota.id); }}
              >
                🗑️
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
