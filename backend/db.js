import mysql from "mysql2/promise";

const pool = mysql.createPool({
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  socketPath: process.env.DB_SOCKET,
});

export default pool;

