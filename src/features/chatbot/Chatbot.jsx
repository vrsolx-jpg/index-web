import { useEffect, useRef, useState } from 'react';
import './Chatbot.css';
import { responderPregunta } from './chatbotResponses.js';

const preguntasFrecuentes = [
  '¿Cómo encuentro un producto?',
  '¿Qué métodos de pago aceptan?',
  '¿Hacen envíos?',
  '¿Cómo consulto mi pedido?',
  '¿Hay unidades disponibles?',
  '¿Cuál es su horario?',
  '¿Cómo puedo contactarlos?',
];

function MessageIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 8.6 8.6 0 0 1-3.5-.8L4 20l1.2-3.4A7.2 7.2 0 0 1 4 12c0-4.1 3.6-7.5 8-7.5s8 2.9 8 7Z" />
      <path d="M8 12h.01M12 12h.01M16 12h.01" />
    </svg>
  );
}

function Chatbot({ isOpen, onOpen, onClose, onBrowseCatalog, onQuote }) {
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'assistant',
      text: '¡Hola! Soy el asistente de Fiesta Colombia. ¿En qué puedo ayudarte?',
    },
  ]);
  const messagesRef = useRef(null);
  const nextMessageId = useRef(2);

  useEffect(() => {
    const panel = messagesRef.current;
    if (panel) panel.scrollTo({ top: panel.scrollHeight, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }, [messages, isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;

    function closeOnEscape(event) {
      if (event.key === 'Escape') onClose();
    }

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [isOpen, onClose]);

  function enviarPregunta(question) {
    const texto = question.trim();
    if (!texto) return;

    const reply = responderPregunta(texto);
    const userMessageId = nextMessageId.current;
    nextMessageId.current += 2;
    setMessages((current) => [
      ...current,
      { id: userMessageId, sender: 'user', text: texto },
      {
        id: userMessageId + 1,
        sender: 'assistant',
        text: reply.text,
        action: reply.action,
      },
    ]);
    setDraft('');
  }

  return (
    <>
      {isOpen && (
        <aside className="chatbot-widget" aria-label="Asistente de Fiesta Colombia">
          <div className="chatbot-heading">
            <div className="chatbot-heading-brand">
              <span className="chatbot-heading-icon"><MessageIcon /></span>
              <div>
                <strong>Asistente de Fiesta</strong>
                <small>¡Estamos aquí para ayudarte!</small>
              </div>
            </div>
            <button type="button" onClick={onClose} aria-label="Cerrar asistente">×</button>
          </div>

          <div className="chatbot-messages" ref={messagesRef} role="log" aria-label="Historial del chat" aria-live="polite" aria-relevant="additions">
            {messages.map((message) => (
              <div className={`chatbot-message chatbot-message--${message.sender}`} key={message.id}>
                <p>{message.text}</p>
                {message.action === 'catalogo' && (
                  <button type="button" className="chatbot-catalog-link" onClick={onBrowseCatalog}>
                    Ver catálogo completo
                  </button>
                )}
                {message.action === 'cotizacion' && <button type="button" className="chatbot-catalog-link" onClick={onQuote}>Cotizar mi evento</button>}
              </div>
            ))}
          </div>

          <details className="chatbot-suggestions" open>
            <summary>Preguntas frecuentes</summary>
            <div className="chatbot-quick-questions" aria-label="Preguntas frecuentes">
            {preguntasFrecuentes.map((question) => (
              <button type="button" key={question} onClick={() => enviarPregunta(question)}>
                {question}
              </button>
            ))}
            </div>
          </details>

          <form
            className="chatbot-form"
            onSubmit={(event) => {
              event.preventDefault();
              enviarPregunta(draft);
            }}
          >
            <input
              type="text"
              placeholder="Escribe tu pregunta..."
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              aria-label="Escribe tu pregunta"
            />
            <button type="submit" aria-label="Enviar mensaje" disabled={!draft.trim()}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 12 20 4l-5 16-3-7-8-1Z" />
                <path d="m12 13 8-9" />
              </svg>
            </button>
          </form>

          <div className="chatbot-powered">Fiesta Colombia · Atención virtual</div>
        </aside>
      )}

      {!isOpen && (
        <button type="button" className="chat-launcher" aria-label="Abrir asistente" onClick={onOpen}>
          <MessageIcon />
          <span>¿Necesitas ayuda?</span>
        </button>
      )}
    </>
  );
}

export default Chatbot;
