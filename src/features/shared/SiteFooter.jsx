import logoFiesta from '../../assets/fiesta-colombia-logo.png';

function SiteFooter({ onShare, onOpenChat, footerRef }) {
  return (
    <footer className="catalog-footer" ref={footerRef}>
      <div className="catalog-footer-main">
        <section className="catalog-footer-brand" aria-labelledby="footer-brand-title">
          <div className="catalog-footer-brand-lockup">
            <img src={logoFiesta} alt="Logo de Fiesta Colombia: confeti dentro de un círculo" />
            <h2 id="footer-brand-title">
              <span>Fiesta</span>
              <span>Colombia</span>
            </h2>
          </div>
        </section>
        <section className="catalog-footer-contact" aria-labelledby="footer-contact-title">
          <h2 id="footer-contact-title">Contacto</h2>
          <p className="catalog-footer-contact-item">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
            Neiva, Huila, Colombia
          </p>
          <a className="catalog-footer-contact-item" href="mailto:contacto@fiestacolombia.com.co">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m4 7 8 6 8-6" />
            </svg>
            contacto@fiestacolombia.com.co
          </a>
          <div className="catalog-footer-links">
            <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" aria-label="Instagram">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle className="social-icon-dot" cx="18" cy="6" r="1" />
              </svg>
            </a>
            <a
              href="https://www.facebook.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M14 21v-8h3l.5-4H14V7c0-1.2.4-2 2-2h1.7V1.4C17 1.2 15.8 1 14.5 1 11.2 1 9 3 9 6.7V9H6v4h3v8z" />
              </svg>
            </a>
            <a href="https://www.tiktok.com/" target="_blank" rel="noreferrer" aria-label="TikTok">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M14 3v11.2a4.2 4.2 0 1 1-3.2-4.1M14 3c.6 3.2 2.7 5.2 6 5.5" />
              </svg>
            </a>
            <button type="button" onClick={onShare} aria-label="Compartir página">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <path d="m8.7 10.6 6.6-4.2m-6.6 7 6.6 4.1" />
              </svg>
            </button>
          </div>
        </section>
        <section className="catalog-footer-hours" aria-labelledby="footer-hours-title">
          <h2 id="footer-hours-title">Horario</h2>
          <p>Servicio completamente online</p>
          <strong>24 horas · todos los días</strong>
        </section>
        <section className="catalog-footer-chat" aria-labelledby="footer-chat-title">
          <h2 id="footer-chat-title">¿Necesitas ayuda?</h2>
          <button type="button" onClick={onOpenChat}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 8.6 8.6 0 0 1-3.5-.8L4 20l1.2-3.4A7.2 7.2 0 0 1 4 12c0-4.1 3.6-7.5 8-7.5s8 2.9 8 7Z" />
              <path d="M8 12h.01M12 12h.01M16 12h.01" />
            </svg>
            <span>Abrir chatbot</span>
          </button>
        </section>
      </div>
      <div className="catalog-footer-copyright">© 2026 Fiesta Colombia. Todos los derechos reservados.</div>
    </footer>
  );
}

export default SiteFooter;
