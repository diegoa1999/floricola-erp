import { useMemo, useState } from "react";
import "./login.css";

const API = "https://floricola-api-765255018585.us-central1.run.app"; // luego cambia a tu backend público

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const year = useMemo(() => new Date().getFullYear(), []);

  const entrar = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Credenciales incorrectas");
        return;
      }

      localStorage.setItem("token", data.token);
      onLogin(data.user, data.token);
    } catch {
      setError("No se pudo conectar con el servidor (backend).");
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e) => {
    if (e.key === "Enter") entrar();
  };

  return (
    <div className="lg-page">
      <div className="lg-glow lg-glow--a" />
      <div className="lg-glow lg-glow--b" />

      <div className="lg-container">
        {/* Topbar */}
        <header className="lg-topbar">
          <div className="lg-brandmini">
            <span className="lg-dot" />
            <span className="lg-brandmini__text">Floricola ERP</span>
          </div>

          <div className="lg-status">
            <span className="lg-pill">Online</span>
            <span className="lg-pill lg-pill--muted">JWT</span>
            <span className="lg-pill lg-pill--muted">Cloud SQL</span>
          </div>
        </header>

        {/* Main */}
        <main className="lg-shell">
          {/* Izquierda */}
          <section className="lg-left" aria-label="Brand">
            <div className="lg-logo">🌹</div>

            <h1 className="lg-title">
              Bienvenido a <span className="lg-accent">Floricola ERP</span>
            </h1>

            <p className="lg-subtitle">
              Controla clientes, inventario y producción desde un panel rápido,
              seguro y fácil de usar.
            </p>

            <div className="lg-features">
              <div className="lg-feature">
                <span className="lg-feature__icon">🔐</span>
                <div>
                  <div className="lg-feature__title">Acceso seguro</div>
                  <div className="lg-feature__desc">
                    Autenticación con JWT
                  </div>
                </div>
              </div>

              <div className="lg-feature">
                <span className="lg-feature__icon">⚡</span>
                <div>
                  <div className="lg-feature__title">Rápido</div>
                  <div className="lg-feature__desc">
                    Interfaz tipo ERP para trabajar fluido
                  </div>
                </div>
              </div>

              <div className="lg-feature">
                <span className="lg-feature__icon">🗄️</span>
                <div>
                  <div className="lg-feature__title">Datos centralizados</div>
                  <div className="lg-feature__desc">
                    MySQL Cloud SQL (tu base en la nube)
                  </div>
                </div>
              </div>
            </div>

            <div className="lg-note">
              <div className="lg-note__title">Tip</div>
              <div className="lg-note__text">
                Si algo se queda en blanco: <b>F12 → Console</b>.
              </div>
            </div>
          </section>

          {/* Derecha: Login */}
          <section
            className={`lg-card ${error ? "lg-card--error" : ""}`}
            aria-label="Login"
          >
            <div className="lg-card__head">
              <h2 className="lg-card__title">Iniciar sesión</h2>
              <p className="lg-card__desc">
                Ingresa tu correo y contraseña para continuar.
              </p>
            </div>

            <div className="lg-form">
              <label className="lg-label">Correo</label>
              <div className="lg-input">
                <span className="lg-input__icon">@</span>
                <input
                  className="lg-input__field"
                  placeholder="admin@roset.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={onKey}
                  autoComplete="email"
                />
              </div>

              <label className="lg-label lg-mt">Contraseña</label>
              <div className="lg-input">
                <span className="lg-input__icon">🔒</span>
                <input
                  className="lg-input__field"
                  placeholder="••••••••"
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={onKey}
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="lg-eye"
                  onClick={() => setShow((s) => !s)}
                  aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
                  title={show ? "Ocultar" : "Mostrar"}
                >
                  {show ? "🙈" : "👁️"}
                </button>
              </div>

              <div className="lg-row">
                <label className="lg-check">
                  <input
                    type="checkbox"
                    checked={show}
                    onChange={(e) => setShow(e.target.checked)}
                  />
                  <span>Mostrar contraseña</span>
                </label>

                <span className="lg-hint">Enter para ingresar</span>
              </div>

              {error && (
                <div className="lg-error">
                  <div className="lg-error__dot">!</div>
                  <div>
                    <div className="lg-error__title">No se pudo ingresar</div>
                    <div className="lg-error__text">{error}</div>
                  </div>
                </div>
              )}

              <button
                className="lg-btn"
                onClick={entrar}
                disabled={loading || !email.trim() || !password.trim()}
              >
                {loading ? (
                  <span className="lg-btn__loading">
                    <span className="lg-spinner" />
                    Ingresando...
                  </span>
                ) : (
                  "Entrar al ERP"
                )}
              </button>

              <div className="lg-foot">
                <span>© {year} Floricola ERP</span>
                <span className="lg-foot__dot">•</span>
                <span>v0.1</span>
              </div>
            </div>
          </section>
        </main>

        {/* Bottom bar */}
        <footer className="lg-bottom">
          <span className="lg-bottom__item">Estado: Online</span>
          <span className="lg-bottom__sep">•</span>
          <span className="lg-bottom__item">API: {API}</span>
          <span className="lg-bottom__sep">•</span>
          <span className="lg-bottom__item">Modo: Desarrollo</span>
        </footer>
      </div>
    </div>
  );
}


