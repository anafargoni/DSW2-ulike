const express = require("express");
const router = express.Router();
const db = require("../db");

router.post("/", async (req, res) => {
  try {
    const { usuario, post, texto } = req.body || {};
    if (!usuario) {
      return res.status(400).json({ mgs: "Usuário inválido" });
    }
    if (!post) {
      return res.status(400).json({ mgs: "Post inválido" });
    }
    if (!texto) {
      return res.status(400).json({ mgs: "Texto inválido" });
    }

    const existeP = await db.query("SELECT * FROM posts WHERE id = $1", [post]);
    if (!existeP.rows.length) {
      return res.status(400).json({ msg: "Post não existe" });
    }

    const existeU = await db.query("SELECT * FROM usuarios WHERE id = $1", [usuario]);
    if (!existeU.rows.length) {
      return res.status(400).json({ msg: "Usuario não existe" });
    }

    const r = await db.query(
      "INSERT INTO comentarios(usuario, texto, post) VALUES ($1, $2, $3) RETURNING *",
      [usuario, texto, post],
    );
    if (!r.rows.length) {
      return res.status(500).json({ msg: "Erro inserção de comentário" });
    } else {
      return res.status(201).json(r.rows[0]);
    }
  } catch (error) {
    return res.status(500).json({ msg: "Erro geral" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    let { usuario, texto } = req.body || {};
    if (!usuario) {
      return res.status(400).json({ mgs: "Usuário inválido" });
    }
    if (!texto) {
      return res.status(400).json({ mgs: "Texto inválido" });
    }
    const existeU = await db.query("SELECT * FROM usuarios WHERE id = $1", [usuario]);
    if (!existeU.rows.length) {
      return res.status(400).json({ msg: "Usuário não existe" });
    }

    const comentario = await db.query("SELECT * FROM comentarios WHERE id = $1", [req.params.id]);
    if (!comentario.rows.length) {
      return res.status(400).json({ msg: "Comentario não existe" });
    }

    if (usuario != comentario.rows[0].usuario) {
      return res
        .status(403)
        .json({ msg: "Você está tentando editar um comentario de outro usuário" });
    }

    const r = await db.query(
      "UPDATE comentarios SET texto = $1, editado = TRUE WHERE id = $2 RETURNING *",
      [texto, req.params.id],
    );
    if (!r.rows.length) {
      return res.status(400).json({ msg: "Erro edição de comentário" });
    } else {
      return res.status(201).json(r.rows[0]);
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Erro geral" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { usuario } = req.body || {};
    if (!usuario) {
      return res.status(400).json({ mgs: "Usuário inválido" });
    }

    const existe = await db.query("SELECT * FROM comentarios WHERE id = $1", [req.params.id]);
    if (!existe.rows.length) {
      return res.status(400).json({ msg: "Não existe este comentário" });
    }

    if (existe.rows[0].usuario != usuario) {
      return res
        .status(400)
        .json({ msg: "Você está tentando deletar um comentário de outro usuário" });
    }

    const r = await db.query("DELETE FROM comentarios WHERE id = $1 RETURNING *", [req.params.id]);
    if (!r.rows.length) {
      return res.status(500).json({ msg: "Erro remover comentário" });
    }
    return res.status(200).json({ msg: "Comentário removido com sucesso" });
  } catch (error) {
    return res.status(500).json({ msg: "error.msg" });
  }
});

module.exports = router;
