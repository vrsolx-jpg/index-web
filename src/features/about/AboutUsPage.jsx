import SiteFooter from '../shared/SiteFooter.jsx';
import SiteHeader from '../shared/SiteHeader.jsx';
import '../catalog/Catalog.css';
import './AboutUsPage.css';

function AboutUsPage({ headerProps, footerRef, onShare, onOpenChat }) {
  return (
    <div className="about-us-page">
      <SiteHeader {...headerProps} />

      <main className="about-us-main">
        <section className="about-us-banner" aria-labelledby="about-us-banner-title">
          <h1 id="about-us-banner-title">Tenemos lo que necesitas: las 3 B</h1>
          <p>Bueno, bonito y al mejor precio para celebrar a tu manera.</p>
        </section>

        <section className="about-us-story" aria-labelledby="about-us-title">
          <img
            className="about-us-image"
            src="https://images.unsplash.com/photo-1699730164892-d7c433524ff3?q=80&w=736&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D"
            alt="Escena festiva para celebrar momentos especiales"
          />
          <div className="about-us-copy">
            <p className="about-us-eyebrow">Fiesta Colombia</p>
            <h2 id="about-us-title">Acerca de nosotros</h2>
            <h3>Celebraciones llenas de alegría</h3>
            <p>
              En Fiesta Colombia creemos que cada celebración merece sentirse especial.
              Por eso reunimos en un solo lugar todo lo necesario para que organizar tus
              momentos más felices sea más fácil.
            </p>
            <p>
              Encontrarás artículos para fiestas, decoración y detalles para acompañar
              cumpleaños, reuniones y ocasiones especiales. Queremos que cada idea
              encuentre opciones bonitas y prácticas para hacerse realidad.
            </p>
            <p>
              Nuestro propósito es ayudarte a celebrar con alegría, cercanía y propuestas
              para diferentes gustos y presupuestos. ¡Tú imaginas el momento, nosotros
              ponemos nuestro granito de fiesta!
            </p>
          </div>
        </section>
      </main>

      <SiteFooter onShare={onShare} onOpenChat={onOpenChat} footerRef={footerRef} />
    </div>
  );
}

export default AboutUsPage;
