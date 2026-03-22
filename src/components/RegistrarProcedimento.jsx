import React, { useState, useEffect } from "react";
import "./RegistrarProcedimento.css";

const PROCEDIMENTOS = {
  "Via Aérea": [
    "Intubação Orotraqueal (IOT)",
    "Intubação Nasotraqueal",
    "Máscara Laríngea",
    "Videolaringoscopia",
    "Cricotireoidostomia",
    "Intubação com Fibroscópio"
  ],
  "Neuroeixo": [
    "Raquianestesia Lombar",
    "Peridural Lombar",
    "Peridural Torácica",
    "Peridural Cervical",
    "Combinada (Raqui + Peri)"
  ],
  "Bloqueios Regionais": "CUSTOM",
  "Acessos Vasculares": [
    "Acesso Venoso Central - Jugular Interna",
    "Acesso Venoso Central - Subclávia",
    "Acesso Venoso Central - Femoral",
    "Punção Arterial - Radial",
    "Punção Arterial - Femoral",
    "Acesso Venoso Periférico Difícil",
    "PICC"
  ]
};

// Sugestões iniciais de bloqueios
const BLOQUEIOS_SUGESTOES = [
  "Plexo Braquial - Interescalênico",
  "Plexo Braquial - Supraclavicular",
  "Plexo Braquial - Infraclavicular",
  "Plexo Braquial - Axilar",
  "Nervo Femoral",
  "Fáscia Ilíaca",
  "Nervo Ciático - Poplíteo",
  "Nervo Ciático - Subglúteo",
  "Bloqueio de Tornozelo",
  "TAP Block",
  "Quadrado Lombar (QL)",
  "PECS I",
  "PECS II",
  "Serrátil",
  "Paravertebral",
  "Eretor da Espinha (ESP)"
];

export function RegistrarProcedimento({ onSave }) {
  const [categoria, setCategoria] = useState("");
  const [procedimento, setProcedimento] = useState("");
  const [bloqueioInput, setBloqueioInput] = useState("");
  const [bloqueiosSalvos, setBloqueiosSalvos] = useState([]);
  const [showSugestoes, setShowSugestoes] = useState(false);
  const [sucesso, setSucesso] = useState(null);
  const [tentativas, setTentativas] = useState(1);
  const [observacoes, setObservacoes] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState(null);

  // Carregar bloqueios salvos do localStorage
  useEffect(() => {
    const salvos = JSON.parse(localStorage.getItem("bloqueiosSalvos") || "[]");
    const todos = [...new Set([...BLOQUEIOS_SUGESTOES, ...salvos])];
    setBloqueiosSalvos(todos);
  }, []);

  // Filtrar sugestões baseado no input
  const sugestoesFiltradas = bloqueiosSalvos.filter(b => 
    b.toLowerCase().includes(bloqueioInput.toLowerCase())
  );

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const novaTag = tagInput.trim().replace(',', '');
      if (novaTag && !tags.includes(novaTag)) {
        setTags([...tags, novaTag]);
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSelectBloqueio = (bloqueio) => {
    setBloqueioInput(bloqueio);
    setProcedimento(bloqueio);
    setShowSugestoes(false);
  };

  const handleBloqueioInputChange = (e) => {
    const value = e.target.value;
    setBloqueioInput(value);
    setProcedimento(value);
    setShowSugestoes(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const procFinal = categoria === "Bloqueios Regionais" ? bloqueioInput : procedimento;
    
    if (!categoria || !procFinal || sucesso === null) {
      setMensagem({ tipo: "erro", texto: "Preencha os campos obrigatórios!" });
      return;
    }

    setSalvando(true);

    // Se for um bloqueio novo, salvar na lista
    if (categoria === "Bloqueios Regionais" && !bloqueiosSalvos.includes(bloqueioInput)) {
      const novosSalvos = [...bloqueiosSalvos, bloqueioInput];
      localStorage.setItem("bloqueiosSalvos", JSON.stringify(novosSalvos));
      setBloqueiosSalvos(novosSalvos);
    }

    const novoProcedimento = {
      id: Date.now(),
      categoria,
      procedimento: procFinal,
      sucesso,
      tentativas,
      observacoes,
      tags,
      data: new Date().toISOString()
    };

    const dadosSalvos = JSON.parse(localStorage.getItem("procedimentos") || "[]");
    dadosSalvos.push(novoProcedimento);
    localStorage.setItem("procedimentos", JSON.stringify(dadosSalvos));

    setTimeout(() => {
      setCategoria("");
      setProcedimento("");
      setBloqueioInput("");
      setSucesso(null);
      setTentativas(1);
      setObservacoes("");
      setTags([]);
      setSalvando(false);
      setMensagem({ tipo: "sucesso", texto: "Procedimento registrado! ✅" });
      
      if (onSave) onSave(novoProcedimento);
      
      setTimeout(() => setMensagem(null), 3000);
    }, 500);
  };

  return (
    <div className="registrar-container">
      <div className="registrar-header">
        <h1 className="registrar-title">Registrar</h1>
        <p className="registrar-subtitle">Novo procedimento</p>
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
              setBloqueioInput("");
            }}
          >
            <option value="">Selecione...</option>
            {Object.keys(PROCEDIMENTOS).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Procedimento - Select normal */}
        {categoria && PROCEDIMENTOS[categoria] !== "CUSTOM" && (
          <div className="form-group">
            <label className="form-label">Procedimento *</label>
            <select 
              className="form-select"
              value={procedimento}
              onChange={(e) => setProcedimento(e.target.value)}
            >
              <option value="">Selecione...</option>
              {PROCEDIMENTOS[categoria].map(proc => (
                <option key={proc} value={proc}>{proc}</option>
              ))}
            </select>
          </div>
        )}

        {/* Bloqueios - Campo com autocomplete */}
        {categoria === "Bloqueios Regionais" && (
          <div className="form-group">
            <label className="form-label">Nome do Bloqueio *</label>
            <p className="form-hint">Digite ou selecione da lista</p>
            <div className="autocomplete-container">
              <input
                type="text"
                className="form-input"
                placeholder="Ex: Plexo Braquial - Axilar"
                value={bloqueioInput}
                onChange={handleBloqueioInputChange}
                onFocus={() => setShowSugestoes(true)}
                onBlur={() => setTimeout(() => setShowSugestoes(false), 200)}
              />
              {showSugestoes && sugestoesFiltradas.length > 0 && (
                <div className="sugestoes-dropdown">
                  {sugestoesFiltradas.slice(0, 8).map((sug, idx) => (
                    <div 
                      key={idx} 
                      className="sugestao-item"
                      onMouseDown={() => handleSelectBloqueio(sug)}
                    >
                      {sug}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Resultado */}
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
          <label className="form-label">Tentativas</label>
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

        {/* Tags */}
        <div className="form-group">
          <label className="form-label">Tags</label>
          <p className="form-hint">Pressione Enter para adicionar</p>
          <div className="tags-container">
            {tags.map((tag, idx) => (
              <span key={idx} className="tag">
                {tag}
                <button 
                  type="button" 
                  className="tag-remove"
                  onClick={() => handleRemoveTag(tag)}
                >
                  ×
                </button>
              </span>
            ))}
            <input
              type="text"
              className="tag-input"
              placeholder={tags.length === 0 ? "Ex: difícil, obeso, urgência..." : ""}
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
            />
          </div>
        </div>

        {/* Observações */}
        <div className="form-group">
          <label className="form-label">Observações</label>
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
          {salvando ? "Salvando..." : "💾 Salvar"}
        </button>

      </form>
    </div>
  );
}
