const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("../db");

router.get("/", async (req, res) => {
  const r = await db.query("SELECT id, login, nome, img FROM usuarios");
  return res.status(200).json(r.rows);
});

router.post("/", async (req, res) => {
  try {
    const { login, senha, nome, img } = req.body || {};
    if (!login) {
      return res.status(400).json({ mgs: "Login inválido" });
    }
    if (!senha) {
      return res.status(400).json({ mgs: "Senha inválida" });
    }
    if (!nome) {
      return res.status(400).json({ mgs: "Nome inválido" });
    }
    const existe = await db.query("SELECT * FROM usuarios WHERE login = $1", [login]);
    if (existe.rows.length) {
      return res.status(400).json({ msg: "Usuário já existe" });
    }

    const hash = await bcrypt.hash(senha, 10);
    const r = await db.query(
      "INSERT INTO usuarios(login, senha, nome, img) VALUES ($1,$2,$3,$4) RETURNING *",
      [login, hash, nome, img],
    );
    if (!r.rows.length) {
      return res.status(500).json({ msg: "Erro inserção de usuário" });
    } else {
      const { senha, ...usuario } = r.rows[0]; // Desestruturação para remover "senha" do usuário.
      return res.status(201).json(usuario);
    }
  } catch (error) {
    return res.status(500).json({ msg: "Erro geral" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { login, senha } = req.body || {};
    if (!login) {
      return res.status(400).json({ mgs: "Login inválido" });
    }
    if (!senha) {
      return res.status(400).json({ mgs: "Senha inválida" });
    }
    const existe = await db.query("SELECT * FROM usuarios WHERE login = $1", [login]);
    if (!existe.rows.length) {
      return res.status(400).json({ msg: "Usuário não existe" });
    }

    const hash = await bcrypt.hash(senha, 10);
    console.log(hash);

    const ok = await bcrypt.compare(senha, existe.rows[0].senha);
    if (ok) {
      const { senha, ...usuario } = existe.rows[0];
      return res.status(200).json({ msg: "Login efetuado com sucesso", usuario: usuario });
    }
    return res.status(403).json({ msg: "Senha incorreta" });
  } catch (error) {
    return res.status(500).json({ msg: "Erro geral" });
  }
});

module.exports = router;
