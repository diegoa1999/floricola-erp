import { useEffect, useState } from "react";
import Login from "./pages/Login";

const API = "https://floricola-api-765255018585-us-central1.run.app";

export default function App() {
  const [user, setUser] = useState(null);

  // ✅ Token en estado (NO se queda “viejo”)
  const [token, setToken] = useState(localStorage.getItem("token"));

  const [checking, setChecking] = useState(true);

  // --- CLIENTES ---
  const [clientes, setClientes] = useState([]);
  const [nombre, setNombre] = useState("");

  const cargarClientes = async (t = token) => {
    if (!t) {
      setClientes([]);
      return;
    }

    const res = await fetch(`${API}/clientes`, {
      headers: { Authorization: `Bearer ${t}` },
    });

    const data = await res.json();

    // ✅ Evita pantalla en blanco si backend responde {error:...}
    setClientes(Array.isArray(data) ? data : []);
  };

  const agregarCliente = async () => {
    if (!nombre.trim()) return;

    await fetch(`${API}/clientes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ nombre }),
    });

    setNombre("");
    cargarClientes();
  };

  const eliminarCliente = async (id) => {
    await fetch(`${API}/clientes/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    cargarClientes();
  };

  // ✅ Al abrir la app: si hay token, valida con /me y carga clientes
  useEffect(() => {
    const check = async () => {
      try {
        if (!token) return;

        const res = await fetch(`${API}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (res.ok) {
          setUser(data.user);
          await cargarClientes(token);
        } else {
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
        }
      } finally {
        setChecking(false);
      }
    };

    check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const salir = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setClientes([]);
  };

  if (checking) {
    return <div style={{ padding: 20, fontFamily: "Arial" }}>Cargando...</div>;
  }

  // ✅ Si no hay token o user -> login
  if (!token || !user) {
    return (
      <Login
        onLogin={async (u, t) => {
          setUser(u);
          setToken(t);
          await cargarClientes(t);
        }}
      />
    );
  }

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 10,
        }}
      >
        <h1>🌹 Florícola ERP</h1>

        <div>
          <span style={{ marginRight: 10 }}>
            {user.email} ({user.role})
          </span>
          <button onClick={salir}>Salir</button>
        </div>
      </div>

      <h2>Clientes</h2>

      <div style={{ display: "flex", gap: 10, margin: "14px 0" }}>
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre del cliente"
          style={{ padding: 10, width: 320 }}
        />
        <button onClick={agregarCliente} style={{ padding: "10px 14px" }}>
          Agregar
        </button>
        <button onClick={() => cargarClientes()} style={{ padding: "10px 14px" }}>
          Recargar
        </button>
      </div>

      <table
        border="1"
        cellPadding="10"
        style={{
          borderCollapse: "collapse",
          width: "100%",
          maxWidth: 900,
        }}
      >
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Acción</th>
          </tr>
        </thead>

        <tbody>
          {clientes.map((c) => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.nombre}</td>
              <td>
                <button onClick={() => eliminarCliente(c.id)}>🗑️</button>
              </td>
            </tr>
          ))}

          {clientes.length === 0 && (
            <tr>
              <td colSpan="3">No hay clientes</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
