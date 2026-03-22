import React, { useState, useEffect } from "react";
import { 
  salvarProcedimento, 
  buscarConfiguracoes, 
  adicionarTipo, 
  adicionarSubdivisao 
} from "../firestoreService";
import { auth } from "../firebase";
import "./RegistrarProcedimento.css";

export function RegistrarProcedimento({ onSave }) {
  // Configurações do usuário
  const [tipos, setTipos] = useState([]);
  const [subdivisoes, setSubdivisoes] = useState({});
  const [carregando, setCarregando] = useState(true);

  // Campos do formulário
  const [tipo, setTipo] = useState("");
  const [subdivisao, setSubdivisao] = useState("");
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [sucesso, setSucesso] = useState(null);
  const [tentativas, setTentativas] = useState(1);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [observacoes, setObservacoes] = useState("");

  // Modais
  const [showModalTipo, setShowModalTipo] = useState(false);
  const [showModalSubdivisao, setShowModalSubdivisao] = useState(false);
  const [novoTipoInput, setNovoTipoInput] = useState("");
  const [novaSubdivisaoInput, setNovaSubdivisaoInput] = useState("");

  // Estado
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState(null);

  // Carregar configurações do usuário
  useEffect(() => {
    carregarConfiguracoes();
  }, []);

  const carregarConfiguracoes = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const config = await buscarConfiguracoes(userId);
      setTipos(config.tipos || []);
      setSubdivisoes(config.subdivisoes || {});
    } catch (error) {
      console.error("Erro ao carregar:", error);
    } finally {
      setCarregando(false);
    }
  };

  // Adicionar novo tipo
  const handleAdicionarTipo = async () => {
    if (!novoTipoInput.trim()) return;

    try {
      const userId = auth.currentUser?.uid;
      const config = await adicionarTipo(userId, novoTipoInput.trim());
      setTipos(config.tipos);
      setSubdivisoes(config.subdivisoes);
      setTipo(novoTipoInput.trim());
      setNovoTipoInput("");
      setShowModalTipo(false);
    } catch (error) {
      console.error("Erro ao adicionar tipo:", error);
    }
  };

  // Adicionar nova subdivisão
  const handleAdicionarSubdivisao = async () => {
    if (!novaSubdivisaoInput.trim() || !tipo) return;

    try {
      const userId = auth.currentUser?.uid;
      const config = await adicionarSubdivisao(userId, tipo, novaSubdivisaoInput.trim());
      setSubdivisoes(config.subdivisoes);
      setSubdivisao(novaSubdivisaoInput.trim());
      setNovaSubdivisaoInput("");
      setShowModalSubdivisao(false);
    } catch (error) {
      console.error("Erro ao adicionar subdivisão:", error);
    }
  };

  // Tags
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

  // Enviar formulário
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!tipo || !subdivisao || !data || sucesso === null) {
      setMensagem({ tipo: "erro", texto: "Preencha os campos obrigatórios!" });
      return;
    }

    setSalvando(true);

    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        setMensagem({ tipo: "erro", texto: "Usuário não autenticado!" });
        setSalvando(false);
        return;
      }

      const novoProcedimento = {
        categoria: tipo,      // Mantém compatibilidade com Dashboard
        procedimento: subdivisao, // Mantém compatibilidade com Dashboard
        tipo,
        subdivisao,
        data,
        sucesso,
        tentativas,
        tags,
        observacoes
      };

      await salvarProcedimento(userId, novoProcedimento);

      // Limpar formulário
      setTipo("");
      setSubdivisao("");
      setData(new Date().toISOString().split('T')[0]);
      setSucesso(null);
      setTentativas(1);
      setTags([]);
      setObservacoes("");

      setMensagem({ tipo: "sucesso", texto: "Procedimento salvo na nuvem! ☁️" });

      if (onSave) onSave(novoProcedimento);

      setTimeout(() => setMensagem(null), 3000);
    } catch (error) {
      console.error("Erro ao salvar:", error);
      setMensagem({ tipo: "erro", texto: "Erro ao salvar. Tente novamente." });
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) {
    return (
      <div className="registrar-container">
        <div className="loading-state">
          <span>☁️</span>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

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

        {/* TIPO */}
        <div className="form-group">
          <label className="form-label">Tipo *</label>
          <div className="select-with-button">
            <select
              className="form-select"
              value={tipo}
              onChange={(e) => {
                setTipo(e.target.value);
                setSubdivisao("");
              }}
            >
              <option value="">Selecione...</option>
              {tipos.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <button
              type="button"
              className="add-btn"
              onClick={() => setShowModalTipo(true)}
            >
              +
            </button>
          </div>
          {tipos.length === 0 && (
            <p className="form-hint">Clique em + para criar seu primeiro tipo</p>
          )}
        </div>

        {/* SUBDIVISÃO */}
        <div className="form-group">
          <label className="form-label">Subdivisão *</label>
          <div className="select-with-button">
            <select
              className="form-select"
              value={subdivisao}
              onChange={(e) => setSubdivisao(e.target.value)}
              disabled={!tipo}
            >
              <option value="">Selecione...</option>
              {(subdivisoes[tipo] || []).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <button
              type="button"
              className="add-btn"
              onClick={() => setShowModalSubdivisao(true)}
              disabled={!tipo}
            >
              +
            </button>
          </div>
          {tipo && (subdivisoes[tipo] || []).length === 0 && (
            <p className="form-hint">Clique em + para criar subdivisões para "{tipo}"</p>
          )}
        </div>

        {/* DATA */}
        <div className="form-group">
          <label className="form-label">Data *</label>
          <input
            type="date"
            className="form-input"
            value={data}
            onChange={(e) => setData(e.target.value)}
          />
        </div>

        {/* RESULTADO */}
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

        {/* TENTATIVAS */}
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

        {/* TAGS */}
        <div className="form-group">
          <label className="form-label">Tags (opcional)</label>
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
              placeholder={tags.length === 0 ? "Ex: difícil, urgência..." : ""}
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
            />
          </div>
        </div>

        {/* OBSERVAÇÕES */}
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

        {/* BOTÃO SALVAR */}
        <button
          type="submit"
          className="submit-btn"
          disabled={salvando}
        >
          {salvando ? "Salvando..." : "💾 Salvar Procedimento"}
        </button>

      </form>

      {/* MODAL - NOVO TIPO */}
      {showModalTipo && (
        <div className="modal-overlay" onClick={() => setShowModalTipo(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Novo Tipo</h3>
            <p className="modal-desc">Ex: Via Aérea, Neuroeixo, Bloqueios...</p>
            <input
              type="text"
              className="form-input"
              placeholder="Nome do tipo"
              value={novoTipoInput}
              onChange={(e) => setNovoTipoInput(e.target.value)}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleAdicionarTipo()}
            />
            <div className="modal-buttons">
              <button
                type="button"
                className="modal-btn cancelar"
                onClick={() => setShowModalTipo(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="modal-btn confirmar"
                onClick={handleAdicionarTipo}
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL - NOVA SUBDIVISÃO */}
      {showModalSubdivisao && (
        <div className="modal-overlay" onClick={() => setShowModalSubdivisao(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Nova Subdivisão</h3>
            <p className="modal-desc">Subdivisão para "{tipo}"</p>
            <input
              type="text"
              className="form-input"
              placeholder="Ex: IOT, Raqui, TAP Block..."
              value={novaSubdivisaoInput}
              onChange={(e) => setNovaSubdivisaoInput(e.target.value)}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleAdicionarSubdivisao()}
            />
            <div className="modal-buttons">
              <button
                type="button"
                className="modal-btn cancelar"
                onClick={() => setShowModalSubdivisao(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="modal-btn confirmar"
                onClick={handleAdicionarSubdivisao}
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
