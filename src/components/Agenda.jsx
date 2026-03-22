import React, { useState } from 'react';
import './Agenda.css';

export function Agenda() {
  const [calendarUrl, setCalendarUrl] = useState('');
  const [showConfig, setShowConfig] = useState(true);

  // Carregar URL salva
  React.useEffect(() => {
    const savedUrl = localStorage.getItem('google_calendar_url');
    if (savedUrl) {
      setCalendarUrl(savedUrl);
      setShowConfig(false);
    }
  }, []);

  const handleSalvar = () => {
    if (calendarUrl.trim()) {
      localStorage.setItem('google_calendar_url', calendarUrl.trim());
      setShowConfig(false);
    }
  };

  const handleEditar = () => {
    setShowConfig(true);
  };

  // Tela de configuração
  if (showConfig) {
    return (
      <div className="agenda-container">
        <div className="agenda-header">
          <h1 className="agenda-title">📅 Agenda</h1>
          <p className="agenda-subtitle">Conecte seu Google Calendar</p>
        </div>

        <div className="agenda-config-card">
          <h3>Como configurar:</h3>
          <ol className="agenda-steps">
            <li>Abra o <strong>Google Calendar</strong> no computador</li>
            <li>Clique em ⚙️ <strong>Configurações</strong></li>
            <li>Selecione seu calendário</li>
            <li>Em "Integrar calendário", copie o <strong>URL público</strong></li>
            <li>Cole abaixo:</li>
          </ol>

          <input
            type="text"
            className="agenda-url-input"
            placeholder="Cole o URL do Google Calendar aqui..."
            value={calendarUrl}
            onChange={(e) => setCalendarUrl(e.target.value)}
          />

          <button className="agenda-salvar-btn" onClick={handleSalvar}>
            💾 Salvar e Conectar
          </button>

          <p className="agenda-tip">
            💡 <strong>Dica:</strong> Certifique-se de que o calendário está configurado como público ou "disponível via link"
          </p>
        </div>
      </div>
    );
  }

  // Tela com calendário
  return (
    <div className="agenda-container">
      <div className="agenda-header">
        <div>
          <h1 className="agenda-title">📅 Agenda</h1>
          <p className="agenda-subtitle">Google Calendar</p>
        </div>
        <button className="agenda-edit-btn" onClick={handleEditar}>⚙️</button>
      </div>

      <div className="agenda-calendar-wrapper">
        <iframe
          src={calendarUrl.includes('embed') ? calendarUrl : `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(calendarUrl)}&ctz=America/Sao_Paulo`}
          className="agenda-iframe"
          frameBorder="0"
          scrolling="no"
          title="Google Calendar"
        />
      </div>
    </div>
  );
}
