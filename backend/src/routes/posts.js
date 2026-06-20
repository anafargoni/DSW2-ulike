const express = require("express");
const router = express.Router();
const db = require("../db");

router.post("/", async (req, res) => {
  try {
    const { usuario, texto, img } = req.body || {};
    if (!usuario) {
      return res.status(400).json({ mgs: "Usuário inválido" });
    }
    if (!texto && !img) {
      return res.status(400).json({ mgs: "Você deve enviar uma imagem e ou um texto!" });
    }

    const existe = await db.query("SELECT * FROM usuarios WHERE id = $1", [usuario]);
    if (!existe.rows.length) {
      return res.status(400).json({ msg: "Usuário não existe" });
    }

    const r = await db.query(
      "INSERT INTO posts(usuario, texto, img) VALUES ($1, $2, $3) RETURNING *",
      [usuario, texto, img],
    );
    if (!r.rows.length) {
      return res.status(400).json({ msg: "Erro inserção de post" });
    } else {
      return res.status(201).json(r.rows[0]);
    }
  } catch (error) {
    return res.status(500).json({ msg: "Erro geral" });
  }
});

router.get("/", async (req, res) => {
  try {
    const posts = await db.query("SELECT * FROM posts ORDER BY data");
    if (!posts.rows.length) {
      return res.status(400).json({ msg: "Nenhum post cadastrado" });
    }

    const retorno = [];
    for (let post of posts.rows) {
      const comentarios = await db.query(
        "SELECT id, usuario, texto, data FROM comentarios WHERE post = $1 ORDER BY DATA",
        [post.id],
      );
      const likes = await db.query(
        "SELECT id, usuario, data  FROM likes WHERE post = $1 ORDER BY data",
        [post.id],
      );

      retorno.push({
        ...post,
        comentarios: comentarios.rows,
        likes: likes.rows,
      });
    }

    res.status(200).json(retorno);
  } catch (error) {
    return res.status(500).json({ msg: "Erro geral" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const post = await db.query("SELECT * FROM posts WHERE id = $1", [req.params.id]);
    if (!post.rows.length) {
      return res.status(400).json({ msg: "Post não encontrado" });
    }

    const comentarios = await db.query(
      "SELECT id, usuario, texto, data FROM comentarios WHERE post = $1 ORDER BY data",
      [post.rows[0].id],
    );
    const likes = await db.query(
      "SELECT id, usuario, data FROM likes WHERE post = $1 ORDER BY data",
      [post.rows[0].id],
    );

    res.status(200).json({
      ...post.rows[0],
      comentarios: comentarios.rows,
      likes: likes.rows,
    });
  } catch (error) {
    return res.status(500).json({ msg: "Erro geral" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    let { usuario, texto, img } = req.body || {};
    if (!usuario) {
      return res.status(400).json({ mgs: "Usuário inválido" });
    }
    if (!texto && !img) {
      return res.status(400).json({ mgs: "Você deve enviar uma imagem e ou um texto!" });
    }
    const existeU = await db.query("SELECT * FROM usuarios WHERE id = $1", [usuario]);
    if (!existeU.rows.length) {
      return res.status(400).json({ msg: "Usuário não existe" });
    }

    const post = await db.query("SELECT * FROM posts WHERE id = $1", [req.params.id]);
    if (!post.rows.length) {
      return res.status(400).json({ msg: "Post não existe" });
    }

    if (usuario != post.rows[0].usuario) {
      return res.status(403).json({ msg: "Você está tentando editar um post de outro usuário" });
    }

    texto = texto || post.rows[0].texto;
    img = img || post.rows[0].img;

    const r = await db.query(
      "UPDATE posts SET texto = $1, img = $2, editado = TRUE WHERE id = $3 RETURNING *",
      [texto, img, req.params.id],
    );
    if (!r.rows.length) {
      return res.status(400).json({ msg: "Erro edição de post" });
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
    const post = await db.query("SELECT * FROM posts WHERE id = $1", [req.params.id]);
    if (!post.rows.length) {
      return res.status(400).json({ msg: "Post não encontrado" });
    }

    const existeU = await db.query("SELECT * FROM usuarios WHERE id = $1", [usuario]);
    if (!existeU.rows.length) {
      return res.status(400).json({ msg: "Usuario não existe" });
    }

    if (usuario != post.rows[0].usuario) {
      return res.status(403).json({ msg: "Você está tentando deletar um post de outro usuário" });
    }

    const r = await db.query("DELETE FROM posts WHERE id = $1 RETURNING *", [req.params.id]);
    if (!r.rows.length) {
      return res.status(500).json({ msg: "Erro ao deletar post!" });
    }
    return res.status(200).json({ msg: "Post deletado com sucesso!" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Erro geral" });
  }
});

module.exports = router;
