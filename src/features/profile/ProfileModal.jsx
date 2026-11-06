import { useState } from 'react';
import discoImage from '../../assets/disco.avif';
import './ProfileModal.css';

function ProfileModal({ mode, onClose, onModeChange }) {
  const [message, setMessage] = useState('');

  function submitAccess(event) {
    event.preventDefault();

    if (
      mode === 'register' &&
      event.currentTarget.elements.password.value !==
        event.currentTarget.elements.confirmPassword.value
    ) {
      setMessage('Las contraseñas no coinciden.');
      return;
    }

    setMessage('El acceso de cuentas aún no está conectado.');
  }

  function simulateGoogle() {
    setMessage('El registro con Google es una demostración y aún no está conectado.');
  }

  function switchMode() {
    setMessage('');
    onModeChange(mode === 'login' ? 'register' : 'login');
  }

  return (
    <div className="auth-overlay">
      <section className="auth-dialog" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <div className="auth-art">
          <img src={discoImage} alt="" />
          <div className="auth-art-copy">
            <strong>¡Celebremos juntos!</strong>
            <small>Todo para hacer especial tu próxima fiesta.</small>
          </div>
        </div>
        <div className="auth-content">
          <button type="button" className="auth-close" aria-label="Cerrar" onClick={onClose}>
            ×
          </button>
          <p className="auth-kicker">FIESTA COLOMBIA</p>
          <h2 id="auth-title">
            {mode === 'login' ? '¡Qué bueno verte!' : 'Crea tu cuenta'}
          </h2>
          <p className="auth-welcome">
            {mode === 'login'
              ? 'Inicia sesión para continuar.'
              : 'Regístrate y empieza a planear momentos inolvidables.'}
          </p>
          <button type="button" className="google-signup" onClick={simulateGoogle}>
            <span className="google-mark" aria-hidden="true">G</span>
            {mode === 'login' ? 'Continuar con Google' : 'Registrarte con Google'}
          </button>
          <div className="auth-divider"><span>o con tu correo</span></div>
          <form className="auth-form" onSubmit={submitAccess}>
            {mode === 'register' && (
              <label>
                Nombre
                <input type="text" name="name" autoComplete="name" placeholder="Tu nombre" required />
              </label>
            )}
            <label>
              Correo electrónico
              <input type="email" name="email" autoComplete="email" placeholder="tu@correo.com" required />
            </label>
            <div className="auth-password-row">
              <label>
                Contraseña
                <input
                  type="password"
                  name="password"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  placeholder="••••••••"
                  required
                />
              </label>
              {mode === 'register' && (
                <label>
                  Repetir contraseña
                  <input
                    type="password"
                    name="confirmPassword"
                    autoComplete="new-password"
                    placeholder="••••••••"
                    required
                  />
                </label>
              )}
            </div>
            {mode === 'register' && (
              <label className="auth-terms">
                <input type="checkbox" name="terms" required />
                <span>Acepto los <a href="#terms">Términos del servicio</a> y la <a href="#privacy">Política de privacidad</a>.</span>
              </label>
            )}
            {mode === 'login' && (
              <button
                type="button"
                className="auth-forgot"
                onClick={() => setMessage('La recuperación de contraseña aún no está conectada.')}
              >
                ¿Olvidaste tu contraseña?
              </button>
            )}
            <button type="submit" className="auth-submit">
              {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
            </button>
            {message && <p className="auth-message" role="status">{message}</p>}
          </form>
          <p className="auth-switch">
            {mode === 'login' ? '¿Aún no tienes cuenta?' : '¿Ya tienes una cuenta?'}
            <button type="button" onClick={switchMode}>
              {mode === 'login' ? 'Regístrate' : 'Inicia sesión'}
            </button>
          </p>
        </div>
      </section>
    </div>
  );
}

export default ProfileModal;
