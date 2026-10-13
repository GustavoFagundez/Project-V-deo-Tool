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
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// ---- Configuracao de autenticacao ----
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  console.error("ERRO: defina JWT_SECRET no arquivo .env (minimo de 32 caracteres).");
  console.error(`Para gerar um: node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`);
  process.exit(1);
}
const JWT_EXPIRES_IN = "7d";
const BCRYPT_ROUNDS = 12;

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

// =========================================================
// Autenticacao: cadastro e login
// =========================================================
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_BYTES = 72; // o bcrypt ignora tudo depois de 72 bytes

// Hash descartavel, usado quando o e-mail nao existe: assim o login leva
// o mesmo tempo nos dois casos e nao revela quais e-mails estao cadastrados.
const DUMMY_HASH = bcrypt.hashSync("senha-descartavel", BCRYPT_ROUNDS);

// Nunca devolver password_hash para o front-end.
function publicUser(row) {
  return { id: row.id, name: row.name, email: row.email, tokens: row.tokens, plan_id: row.plan_id };
}

function signToken(userId) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// ---- Cadastro ----
app.post("/api/auth/register", async (req, res) => {
  try {
    const name = String(req.body.name ?? "").trim();
    const email = String(req.body.email ?? "").trim().toLowerCase();
    const password = String(req.body.password ?? "");

    if (name.length < 2 || name.length > 120) {
      return res.status(400).json({ message: "Informe seu nome (de 2 a 120 caracteres)." });
    }
    if (!EMAIL_REGEX.test(email) || email.length > 160) {
      return res.status(400).json({ message: "Informe um e-mail válido." });
    }
    if (password.length < PASSWORD_MIN_LENGTH) {
      return res.status(400).json({ message: `A senha deve ter pelo menos ${PASSWORD_MIN_LENGTH} caracteres.` });
    }
    if (Buffer.byteLength(password, "utf8") > PASSWORD_MAX_BYTES) {
      return res.status(400).json({ message: "A senha é muito longa." });
    }

    const id = crypto.randomUUID();
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // A conta nasce no plano "free", com os tokens que esse plano inclui.
    const [result] = await pool.query(
      `INSERT INTO users (id, name, email, password_hash, tokens, plan_id)
       SELECT ?, ?, ?, ?, tokens_included, id FROM plans WHERE id = 'free'`,
      [id, name, email, passwordHash]
    );
    if (result.affectedRows === 0) {
      console.error('Plano "free" nao encontrado na tabela plans.');
      return res.status(500).json({ message: "Erro interno. Tente novamente." });
    }

    const [rows] = await pool.query(
      "SELECT id, name, email, tokens, plan_id FROM users WHERE id = ?",
      [id]
    );
    res.status(201).json({ token: signToken(id), user: publicUser(rows[0]) });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Este e-mail já está cadastrado." });
    }
    console.error(error);
    res.status(500).json({ message: "Erro interno. Tente novamente." });
  }
});

// ---- Login ----
app.post("/api/auth/login", async (req, res) => {
  try {
    const email = String(req.body.email ?? "").trim().toLowerCase();
    const password = String(req.body.password ?? "");

    if (!email || !password) {
      return res.status(400).json({ message: "Informe e-mail e senha." });
    }

    const [rows] = await pool.query(
      "SELECT id, name, email, password_hash, tokens, plan_id FROM users WHERE email = ?",
      [email]
    );
    const user = rows[0];

    // Sempre compara (com o hash descartavel se o usuario nao existe) e
    // devolve a mesma mensagem para "e-mail nao existe" e "senha errada".
    const passwordOk = await bcrypt.compare(password, user ? user.password_hash : DUMMY_HASH);
    if (!user || !passwordOk) {
      return res.status(401).json({ message: "E-mail ou senha incorretos." });
    }

    res.json({ token: signToken(user.id), user: publicUser(user) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro interno. Tente novamente." });
  }
});

// TODO: rotas POST para gravar um novo registro em "history" apos cada
// chamada de API de IA feita no front-end.

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`VideoTool backend rodando em http://localhost:${PORT}`);
});
