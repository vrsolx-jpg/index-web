function SiteFooter({ onShare, footerRef }) {
  return (
    <footer className="catalog-footer" ref={footerRef}>
      <div className="catalog-footer-main">
        <section className="catalog-footer-brand" aria-labelledby="footer-brand-title">
          <h2 id="footer-brand-title">Fiesta Colombia</h2>
          <p>
            Tu aliado estratégico para los momentos más especiales de tu vida.
            Fiesta y repostería.
          </p>
        </section>
        <section className="catalog-footer-contact" aria-labelledby="footer-contact-title">
          <h2 id="footer-contact-title">Contacto</h2>
          <div className="catalog-footer-links">
            <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" aria-label="Instagram">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle className="social-icon-dot" cx="18" cy="6" r="1" />
              </svg>
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
              target="_blank"
              rel="noreferrer"
              aria-label="Compartir en Facebook"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M14 21v-8h3l.5-4H14V7c0-1.2.4-2 2-2h1.7V1.4C17 1.2 15.8 1 14.5 1 11.2 1 9 3 9 6.7V9H6v4h3v8z" />
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
          <a className="catalog-footer-email" href="mailto:hola@fiestacolombia.com">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m4 7 8 6 8-6" />
            </svg>
            hola@fiestacolombia.com
          </a>
        </section>
      </div>
      <div className="catalog-footer-copyright">© 2026 Fiesta Colombia. Todos los derechos reservados.</div>
    </footer>
  );
}

export default SiteFooter;
