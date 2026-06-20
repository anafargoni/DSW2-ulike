const express = require("express");
const router = express.Router();
const db = require("../db");

router.post("/", async (req, res) => {
  try {
    const { usuario, post } = req.body || {};
    if (!usuario) {
      return res.status(400).json({ mgs: "Usuário inválido" });
    }
    if (!post) {
      return res.status(400).json({ mgs: "Post inválido" });
    }

    const existeU = await db.query("SELECT * FROM usuarios WHERE id = $1", [usuario]);
    if (!existeU.rows.length) {
      return res.status(400).json({ msg: "Usuário não existe" });
    }

    const existeP = await db.query("SELECT * FROM posts WHERE id = $1", [post]);
    if (!existeP.rows.length) {
      return res.status(400).json({ msg: "Post não existe" });
    }

    const r = await db.query("SELECT * FROM likes WHERE post = $1 AND usuario = $2", [
      post,
      usuario,
    ]);
    if (!r.rows.length) {
      const ins = await db.query("INSERT INTO likes(usuario, post) VALUES ($1, $2) RETURNING *", [
        usuario,
        post,
      ]);
      if (ins.rows.length) {
        return res.status(201).json({ msg: "Like adicionado com sucesso!" });
      } else {
        return res.status(500).json({ msg: "Erro ao adicionar o like!" });
      }
    } else {
      const del = await db.query("DELETE FROM likes WHERE usuario = $1 AND post = $2 RETURNING *", [
        usuario,
        post,
      ]);
      if (del.rows.length) {
        return res.status(201).json({ msg: "Like removido com sucesso!" });
      } else {
        return res.status(500).json({ msg: "Erro ao remover o like!" });
      }
    }
  } catch (error) {
    return res.status(500).json({ msg: "Erro geral" });
  }
});

module.exports = router;
