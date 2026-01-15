/******************************************************
 * CONFIGURACIÓN INICIAL
 ******************************************************/
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./db");

const bcrypt = require("bcryptjs");     // se usará en A4
const jwt = require("jsonwebtoken");    // se usará en A5

const app = express();
app.use(cors());
app.use(express.json());

/******************************************************
 * HEALTH CHECK
 ******************************************************/
app.get("/health", (req, res) => {
  res.json({ ok: true, message: "Backend funcionando ✅" });
});

/******************************************************
 * INIT CLIENTES (ya lo tenías)
 ******************************************************/
app.get("/init", async (req, res) => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS clientes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(120) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  res.json({ ok: true, msg: "Tabla clientes lista ✅" });
});

/******************************************************
 * A3️⃣ INIT USERS (LOGIN)
 ******************************************************/
app.get("/init-users", async (req, res) => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(190) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  res.json({ ok: true, msg: "Tabla users lista ✅" });
});
/******************************************************
 * A4️⃣ REGISTER: crear usuario
 ******************************************************/
app.post("/auth/register", async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Faltan datos (email, password)" });
  }

  const password_hash = await bcrypt.hash(password, 10);

  try {
    const [r] = await pool.query(
      "INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)",
      [email.toLowerCase(), password_hash, role || "user"]
    );

    res.json({ ok: true, id: r.insertId, email: email.toLowerCase(), role: role || "user" });
  } catch (e) {
    const msg = String(e.message || e);
    if (msg.includes("Duplicate")) {
      return res.status(409).json({ error: "Ese email ya existe" });
    }
    console.error(e);
    res.status(500).json({ error: "Error registrando usuario" });
  }
});
/******************************************************
 * A5️⃣ LOGIN: devuelve JWT
 ******************************************************/
app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Faltan datos (email, password)" });
  }

  const [rows] = await pool.query(
    "SELECT id, email, password_hash, role FROM users WHERE email = ?",
    [email.toLowerCase()]
  );

  if (rows.length === 0) {
    return res.status(401).json({ error: "Credenciales incorrectas" });
  }

  const user = rows[0];
  const ok = await bcrypt.compare(password, user.password_hash);

  if (!ok) {
    return res.status(401).json({ error: "Credenciales incorrectas" });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  );

  res.json({
    ok: true,
    token,
    user: { id: user.id, email: user.email, role: user.role },
  });
});
/******************************************************
 * A6️⃣ MIDDLEWARE AUTH (proteger rutas)
 ******************************************************/
function auth(req, res, next) {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;

  if (!token) return res.status(401).json({ error: "Sin token" });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ error: "Token inválido" });
  }
}

/******************************************************
 * A6️⃣ RUTA PROTEGIDA DE PRUEBA
 ******************************************************/
app.get("/me", auth, (req, res) => {
  res.json({ ok: true, user: req.user });
});


/******************************************************
 * CLIENTES - LISTAR
 ******************************************************/
app.get("/clientes", auth, async (req, res) => {
  const [rows] = await pool.query(
    "SELECT * FROM clientes ORDER BY id DESC"
  );
  res.json(rows);
});

/******************************************************
 * CLIENTES - AGREGAR
 ******************************************************/
app.post("/clientes", auth, async (req, res) => {
  const { nombre } = req.body;
  if (!nombre) {
    return res.status(400).json({ error: "Falta nombre" });
  }

  const [result] = await pool.query(
    "INSERT INTO clientes (nombre) VALUES (?)",
    [nombre]
  );

  res.json({
    id: result.insertId,
    nombre,
  });
});

/******************************************************
 * CLIENTES - ELIMINAR
 ******************************************************/
app.delete("/clientes/:id", auth, async (req, res) => {
  const { id } = req.params;

  await pool.query(
    "DELETE FROM clientes WHERE id = ?",
    [id]
  );

  res.json({ ok: true });
});

/******************************************************
 * ARRANQUE DEL SERVIDOR
 ******************************************************/
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`API corriendo en http://localhost:${PORT}`);
});
