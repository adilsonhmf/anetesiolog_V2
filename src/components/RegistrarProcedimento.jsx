import React, { useState } from 'react';
import { salvarProcedimento } from '../firestoreService';
import { auth } from '../firebase';
import './RegistrarProcedimento.css';

export function RegistrarProcedimento() {
  const [formData, setFormData] = useState({
    tipo: '',
    supervisor: '',
    data: new Date().toISOString().split('T')[0],
    observacoes: ''
  });
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState(null);

  const tipos = [
    'Geral',
    'Neuroeixo', 
    'Bloqueio de Nervos Periféricos',
    'Sedação',
    'IOT',
    'Máscara Laríngea',
    'Punção Venosa Central',
    'Punção Arterial'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.tipo) {
      setMensagem({ tipo: 'erro', texto: 'Selecione o tipo de procedimento!' });
      return;
    }

    setSalvando(true);
    setMensagem(null);

    try {
      const userId = auth.currentUser.uid;
      await salvarProcedimento(userId, {
        tipo: formData.tipo,
        supervisor: formData.supervisor,
        data: formData.data,
        observacoes: formData.observacoes,
        sucesso: true
      });

      setMensagem({ tipo: 'sucesso', texto: 'Procedimento salvo na nuvem! ☁️' });
      
      // Limpa o formulário
      setFormData({
        tipo: '',
        supervisor: '',
        data: new Date().toISOString().split('T')[0],
        observacoes: ''
      });

    } catch (error) {
      console.error("Erro:", error);
      setMensagem({ tipo: 'erro', texto: 'Erro ao salvar. Tente novamente.' });
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="registrar-container">
      <div className="registrar-header">
        <h1>Novo Procedimento</h1>
        <p>Registre seu procedimento anestésico</p>
      </div>

      <form onSubmit={handleSubmit} className="registrar-form">
        {mensagem && (
          <div className={`mensagem ${mensagem.tipo}`}>
            {mensagem.texto}
          </div>
        )}

        <div className="form-group">
          <label>Tipo de Procedimento *</label>
          <select 
            name="tipo" 
            value={formData.tipo} 
            onChange={handleChange}
            required
          >
            <option value="">Selecione...</option>
            {tipos.map(tipo => (
              <option key={tipo} value={tipo}>{tipo}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Data</label>
          <input 
            type="date" 
            name="data" 
            value={formData.data} 
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Supervisor (opcional)</label>
          <input 
            type="text" 
            name="supervisor" 
            value={formData.supervisor} 
            onChange={handleChange}
            placeholder="Nome do supervisor"
          />
        </div>

        <div className="form-group">
          <label>Observações (opcional)</label>
          <textarea 
            name="observacoes" 
            value={formData.observacoes} 
            onChange={handleChange}
            placeholder="Detalhes do procedimento..."
            rows="3"
          />
        </div>

        <button 
          type="submit" 
          className="btn-salvar"
          disabled={salvando}
        >
          {salvando ? 'Salvando...' : '💾 Salvar Procedimento'}
        </button>
      </form>
    </div>
  );
}
