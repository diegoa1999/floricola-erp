import mysql from "mysql2/promise";

const pool = mysql.createPool({
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,

  // 👇 ESTO ES LO CLAVE EN CLOUD RUN + CLOUD SQL
  socketPath: process.env.DB_SOCKET, 
});

export default pool;

