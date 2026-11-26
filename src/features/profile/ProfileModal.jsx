import { useState } from 'react';
import { cargarPerfil, loginUser, registerUser } from '../shop/shopStore.js';
import './ProfileModal.css';

function ProfileModal({ mode, notice = '', onClose, onModeChange, onSuccess }) {
  const [message, setMessage] = useState(notice);
  const [submitting, setSubmitting] = useState(false);

 async function submitAccess(event) {
  event.preventDefault();
  if (submitting) return;

  const campos = event.currentTarget.elements;

  if (mode === 'register' && campos.password.value !== campos.confirmPassword.value) {
    setMessage('Las contraseñas no coinciden.');
    return;
  }

  const resultado = mode === 'register'
    ? registerUser({
      name: campos.name.value,
      email: campos.email.value,
      password: campos.password.value,
    })
    : loginUser(campos.email.value, campos.password.value);

  if (!resultado.ok) {
    setMessage(resultado.error);
    return;
  }

  setSubmitting(true);
  let aviso = '';
  try { await cargarPerfil({ force: true }); }
  catch { aviso = 'Sesión iniciada. No pudimos cargar tus datos guardados; puedes reintentar desde Mi perfil.'; }
  setSubmitting(false);
  onSuccess(mode, aviso);
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
          <img src="https://images.unsplash.com/photo-1608048608029-99c772d199ed?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D" alt="" />
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
            <button type="submit" disabled={submitting} className="auth-submit">
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
