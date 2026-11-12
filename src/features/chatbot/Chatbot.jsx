import { useEffect, useRef, useState } from 'react';
import './Chatbot.css';

const preguntasFrecuentes = [
  '¿Cómo encuentro un producto?',
  '¿Qué métodos de pago aceptan?',
  '¿Hacen envíos?',
  '¿Cómo consulto mi pedido?',
  '¿Hay unidades disponibles?',
  '¿Cuál es su horario?',
  '¿Cómo puedo contactarlos?',
];

function responderPregunta(question) {
  const pregunta = question.toLocaleLowerCase('es');

  if (pregunta.includes('producto') || pregunta.includes('catálogo') || pregunta.includes('catalogo')) {
    return 'Puedes explorar las categorías y ver el catálogo completo en la sección “Categorías destacadas”.';
  }
  if (pregunta.includes('pago') || pregunta.includes('pagar')) {
    return 'La información de pago está por confirmarse. Escríbenos a contacto@fiestacolombia.example y te ayudaremos.';
  }
  if (pregunta.includes('envío') || pregunta.includes('envio') || pregunta.includes('entrega')) {
    return 'Estamos confirmando las opciones y cobertura de envío. Contáctanos para consultar tu pedido.';
  }
  if (pregunta.includes('pedido')) {
    return 'Para consultar el estado de un pedido, escríbenos a contacto@fiestacolombia.example o llámanos al +57 300 000 0000.';
  }
  if (pregunta.includes('stock') || pregunta.includes('unidades') || pregunta.includes('disponibilidad')) {
    return 'Puedes revisar la disponibilidad indicada en cada producto. Para confirmar existencias antes de comprar, contáctanos directamente.';
  }
  if (pregunta.includes('horario') || pregunta.includes('atienden') || pregunta.includes('abierto')) {
    return 'Somos una tienda completamente online y puedes visitarnos por aquí las 24 horas, todos los días.';
  }
  if (
    pregunta.includes('contacto')
    || pregunta.includes('correo')
    || pregunta.includes('teléfono')
    || pregunta.includes('telefono')
    || pregunta.includes('ubicación')
    || pregunta.includes('ubicacion')
  ) {
    return 'Estamos en Neiva, Huila, Colombia. Puedes escribirnos a contacto@fiestacolombia.example o llamar al +57 300 000 0000.';
  }

  return 'Gracias por escribirnos. No tengo esa respuesta por ahora; puedes contactarnos en contacto@fiestacolombia.example o al +57 300 000 0000.';
}

function MessageIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 8.6 8.6 0 0 1-3.5-.8L4 20l1.2-3.4A7.2 7.2 0 0 1 4 12c0-4.1 3.6-7.5 8-7.5s8 2.9 8 7Z" />
      <path d="M8 12h.01M12 12h.01M16 12h.01" />
    </svg>
  );
}

function Chatbot({ isOpen, onOpen, onClose, onBrowseCatalog }) {
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'assistant',
      text: '¡Hola! Soy el asistente de Fiesta Colombia. ¿En qué puedo ayudarte?',
    },
  ]);
  const messagesEndRef = useRef(null);
  const nextMessageId = useRef(2);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
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

    const userMessageId = nextMessageId.current;
    nextMessageId.current += 2;
    setMessages((current) => [
      ...current,
      { id: userMessageId, sender: 'user', text: texto },
      {
        id: userMessageId + 1,
        sender: 'assistant',
        text: responderPregunta(texto),
        showCatalogLink: texto.toLocaleLowerCase('es').includes('producto')
          || texto.toLocaleLowerCase('es').includes('catálogo')
          || texto.toLocaleLowerCase('es').includes('catalogo'),
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

          <div className="chatbot-messages" aria-live="polite">
            {messages.map((message) => (
              <div className={`chatbot-message chatbot-message--${message.sender}`} key={message.id}>
                <p>{message.text}</p>
                {message.showCatalogLink && (
                  <button type="button" className="chatbot-catalog-link" onClick={onBrowseCatalog}>
                    Ir a categorías destacadas
                  </button>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-quick-questions" aria-label="Preguntas frecuentes">
            {preguntasFrecuentes.map((question) => (
              <button type="button" key={question} onClick={() => enviarPregunta(question)}>
                {question}
              </button>
            ))}
          </div>

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
