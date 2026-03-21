import React, { useState } from "react";
import "./RegistrarProcedimento.css";

const PROCEDIMENTOS = {
  "Via Aérea": [
    "Intubação Orotraqueal",
    "Máscara Laríngea", 
    "Videolaringoscopia",
    "Intubação Nasotraqueal",
    "Cricotireoidostomia"
  ],
  "Bloqueios Regionais": [
    "Raquianestesia",
    "Peridural",
    "Bloqueio de Plexo Braquial",
    "Bloqueio de Nervo Femoral",
    "Bloqueio TAP"
  ],
  "Acessos Vasculares": [
    "Acesso Venoso Central",
    "Punção Arterial",
    "Acesso Venoso Periférico Difícil"
  ]
};

export function RegistrarProcedimento({ onSave }) {
  const [categoria, setCategoria] = useState("");
  const [procedimento, setProcedimento] = useState("");
  const [sucesso, setSucesso] = useState(null);
  const [tentativas, setTentativas] = useState(1);
  const [supervisor, setSupervisor] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!categoria || !procedimento || sucesso === null) {
      setMensagem({ tipo: "erro", texto: "Preencha os campos obrigatórios!" });
      return;
    }

    setSalvando(true);

    const novoProcedimento = {
      id: Date.now(),
      categoria,
      procedimento,
      sucesso,
      tentativas,
      supervisor,
      observacoes,
      data: new Date().toISOString()
    };

    // Salvar no localStorage
    const dadosSalvos = JSON.parse(localStorage.getItem("procedimentos") || "[]");
    dadosSalvos.push(novoProcedimento);
    localStorage.setItem("procedimentos", JSON.stringify(dadosSalvos));

    // Limpar formulário
    setTimeout(() => {
      setCategoria("");
      setProcedimento("");
      setSucesso(null);
      setTentativas(1);
      setSupervisor("");
      setObservacoes("");
      setSalvando(false);
      setMensagem({ tipo: "sucesso", texto: "Procedimento registrado com sucesso! ✅" });
      
      if (onSave) onSave(novoProcedimento);
      
      setTimeout(() => setMensagem(null), 3000);
    }, 500);
  };

  return (
    <div className="registrar-container">
      <div className="registrar-header">
        <h1 className="registrar-title">Registrar Procedimento</h1>
        <p className="registrar-subtitle">Adicione um novo procedimento ao seu log</p>
      </div>

      {mensagem && (
        <div className={`mensagem ${mensagem.tipo}`}>
          {mensagem.texto}
        </div>
      )}

      <form onSubmit={handleSubmit} className="registrar-form">
        
        {/* Categoria */}
        <div className="form-group">
          <label className="form-label">Categoria *</label>
          <select 
            className="form-select"
            value={categoria}
            onChange={(e) => {
              setCategoria(e.target.value);
              setProcedimento("");
            }}
          >
            <option value="">Selecione uma categoria</option>
            {Object.keys(PROCEDIMENTOS).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Procedimento */}
        <div className="form-group">
          <label className="form-label">Procedimento *</label>
          <select 
            className="form-select"
            value={procedimento}
            onChange={(e) => setProcedimento(e.target.value)}
            disabled={!categoria}
          >
            <option value="">Selecione o procedimento</option>
            {categoria && PROCEDIMENTOS[categoria].map(proc => (
              <option key={proc} value={proc}>{proc}</option>
            ))}
          </select>
        </div>

        {/* Sucesso */}
        <div className="form-group">
          <label className="form-label">Resultado *</label>
          <div className="radio-group">
            <button
              type="button"
              className={`radio-btn sucesso ${sucesso === true ? 'selected' : ''}`}
              onClick={() => setSucesso(true)}
            >
              ✅ Sucesso
            </button>
            <button
              type="button"
              className={`radio-btn falha ${sucesso === false ? 'selected' : ''}`}
              onClick={() => setSucesso(false)}
            >
              ❌ Insucesso
            </button>
          </div>
        </div>

        {/* Tentativas */}
        <div className="form-group">
          <label className="form-label">Número de tentativas</label>
          <div className="tentativas-control">
            <button 
              type="button" 
              className="tentativas-btn"
              onClick={() => setTentativas(Math.max(1, tentativas - 1))}
            >
              −
            </button>
            <span className="tentativas-valor">{tentativas}</span>
            <button 
              type="button" 
              className="tentativas-btn"
              onClick={() => setTentativas(tentativas + 1)}
            >
              +
            </button>
          </div>
        </div>

        {/* Supervisor */}
        <div className="form-group">
          <label className="form-label">Supervisor (opcional)</label>
          <input
            type="text"
            className="form-input"
            placeholder="Nome do supervisor"
            value={supervisor}
            onChange={(e) => setSupervisor(e.target.value)}
          />
        </div>

        {/* Observações */}
        <div className="form-group">
          <label className="form-label">Observações (opcional)</label>
          <textarea
            className="form-textarea"
            placeholder="Detalhes adicionais..."
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            rows={3}
          />
        </div>

        {/* Botão Submit */}
        <button 
          type="submit" 
          className="submit-btn"
          disabled={salvando}
        >
          {salvando ? "Salvando..." : "💾 Salvar Procedimento"}
        </button>

      </form>
    </div>
  );
}
