// =========================================================
// server.js
// Backend minimo do VideoTool: conecta no MySQL (via mysql2)
// e expoe rotas simples para o front-end consumir.
// =========================================================

require("dotenv").config();
console.log("Porta configurada:", process.env.DB_PORT);
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();
app.use(cors());
app.use(express.json());

// ---- Conexao com o banco (pool = reaproveita conexoes) ----
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

// ---- Rota de teste ----
app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", database: "connected" });
  } catch (error) {
   console.error(error);
    res.status(500).json({ status: "error", message: error.message });
  }
});

// ---- Planos ----
app.get("/api/plans", async (req, res) => {
  try {
    const [plans] = await pool.query("SELECT * FROM plans");
    const [features] = await pool.query("SELECT * FROM plan_features");

    const plansWithFeatures = plans.map((plan) => ({
      ...plan,
      features: features
        .filter((feature) => feature.plan_id === plan.id)
        .map((feature) => feature.feature),
    }));

    res.json(plansWithFeatures);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ---- Ferramentas (barra lateral) ----
app.get("/api/tools", async (req, res) => {
  try {
    const [tools] = await pool.query("SELECT * FROM tools");
    res.json(tools);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ---- Historico de um usuario ----
// TODO: trocar ":userId" fixo por autenticacao real (sessao/token).
app.get("/api/users/:userId/history", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT h.id, h.status, h.result_url, h.created_at, t.name AS tool_name
       FROM history h
       JOIN tools t ON t.id = h.tool_id
       WHERE h.user_id = ?
       ORDER BY h.created_at DESC`,
      [req.params.userId]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ---- Imagens salvas de um usuario ----
app.get("/api/users/:userId/images", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM images WHERE user_id = ? ORDER BY created_at DESC",
      [req.params.userId]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ---- Videos salvos de um usuario ----
app.get("/api/users/:userId/videos", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM videos WHERE user_id = ? ORDER BY created_at DESC",
      [req.params.userId]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ---- Saldo de tokens de um usuario ----
app.get("/api/users/:userId/tokens", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT tokens FROM users WHERE id = ?",
      [req.params.userId]
    );
    if (rows.length === 0) return res.status(404).json({ message: "Usuario nao encontrado" });
    res.json({ tokens: rows[0].tokens });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// TODO: rotas de login/registro (com hash de senha, ex.: bcrypt) e
// rotas POST para gravar um novo registro em "history" apos cada
// chamada de API de IA feita no front-end.

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`VideoTool backend rodando em http://localhost:${PORT}`);
});
