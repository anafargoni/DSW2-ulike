const API_URL = "https://dsw2-ulike.onrender.com";

let usuarios = [];

let postIdComentarioAtual = null;
let idComentarioAtual = null;
let idUsuarioPostAtual = null;

async function carregarUsuarios() {
  let resposta = await fetch(`${API_URL}/usuarios`);
  usuarios = await resposta.json();
}

async function iniciar() {
  await carregarUsuarios();
  let usuarioLogado = localStorage.getItem("usuarioLogado");
  carregarPosts();
  if (usuarioLogado) {
    mostrarBotaoNovoPost();
  }
  atualizarDropdown();
}

iniciar();

let formLogin = document.getElementById("formLogin");
let formCadastro = document.getElementById("formCadastro");
let formNovoPost = document.getElementById("formNovoPost");
let botaoNovoPost = document.getElementById("abrirNovoPost");
let formNovoComentario = document.getElementById("formNovoComentario");
let formEditarPost = document.getElementById("formEditarPost");
let formEditarComentario = document.getElementById("formEditarComentario");

function carregarPosts() {

  document.getElementById("listaPosts").innerText = "";

  fetch(`${API_URL}/posts`)
    .then((resposta) => {
      if (!resposta.ok) {
        throw new Error("Erro na requisição");
      }
      return resposta.json();
    })
    .then((posts) => {
      for (let i = 0; i < posts.length; i++) {
        adicionarPost(posts[i]);
      }
    })
    .catch((erro) => {
      console.error(erro);
    });
}

function adicionarPost(post) {

  let novoPost = document.createElement("div");
  novoPost.classList.add("card");
  novoPost.classList.add("mb-3"); // classe do card

  // FOTO DO USUÁRIO
  let avatar = document.createElement("img");
  avatar.src = fotoUsuario(post.usuario);
  avatar.alt = "Foto de perfil";
  avatar.classList.add("avatar-post"); // pro css

  // CONTAINER DO USUÁRIO
  let usuarioContainer = document.createElement("div");
  usuarioContainer.classList.add("post-usuario-container"); // pro css

  let postUsuario = document.createElement("h5");
  postUsuario.innerText = nomeUsuario(post.usuario);
  postUsuario.classList.add("card-title");

  usuarioContainer.append(avatar, postUsuario); // avatar + nome juntos

  // CONTEÚDO DO POST
  let conteudo = document.createElement("div");
  conteudo.classList.add("card-body"); // corpo do card

  let conteudoData = document.createElement("p");
  conteudoData.classList.add("card-text");

  let postData = document.createElement("small");
  postData.classList.add("text-body-secondary");
  postData.innerText = tempoRelativo(post.data);

  let idUsuario = localStorage.getItem("usuarioLogado");

  // EDITAR POST
  if ((idUsuario) && (idUsuario == post.usuario)) {
    let btnEditarPost = document.createElement("button");
    btnEditarPost.classList.add("btn", "btn-icon"); // botão

    let iconeEditar = document.createElement("i");
    iconeEditar.classList.add("bi", "bi-pencil"); // ícone vai aqui

    btnEditarPost.append(iconeEditar);

    btnEditarPost.addEventListener("click", () => {
      editarPost(post.id, post.texto, post.img);
    });
    novoPost.append(btnEditarPost);
  }

  // DELETAR POST

  if (idUsuario && idUsuario == post.usuario) {
    let btnDeletarPost = document.createElement("button");
    btnDeletarPost.classList.add("btn", "btn-icon"); // opcional

    // ícone do lixo
    let iconeDeletar = document.createElement("i");
    iconeDeletar.classList.add("bi", "bi-trash3-fill");
    btnDeletarPost.append(iconeDeletar);

    // span para o texto "Tem certeza?" que começa vazio
    let textoConfirmacao = document.createElement("span");
    textoConfirmacao.style.marginLeft = "5px"; // espaçamento entre ícone e texto
    textoConfirmacao.innerText = ""; // começa vazio
    btnDeletarPost.append(textoConfirmacao);

    let confirmou = false;
    btnDeletarPost.addEventListener("click", () => {
      if (!confirmou) {
        textoConfirmacao.innerText = "Tem certeza?"; // adiciona o texto
        confirmou = true;
        return;
      }
      deletarPost(post.id);
    });

    novoPost.append(btnDeletarPost);
  }

  // TEXTO
  let postTexto = document.createElement("p");
  postTexto.innerText = post.texto || "";
  postTexto.classList.add("card-text");

  // IMAGEM 
  if (post.img) {
    let postImagem = document.createElement("img");
    postImagem.src = post.img;
    postImagem.classList.add("card-img-top");

    novoPost.append(postImagem);
  }

  // todo o conteúdo que "vem do formulario"
  conteudoData.append(postData);
  conteudo.append(usuarioContainer, postTexto, conteudoData);

  // CURTIDAS
  let curtidas = document.createElement("div");
  let btnCurtidas = document.createElement("button");
  btnCurtidas.classList.add("btn", "btn-curtir"); // classe do bootstrap, fica neutro // mudei aqui

  let iconeCurtida = document.createElement("i");
  iconeCurtida.classList.add("bi", "bi-heart"); // boostrap icons 
  iconeCurtida.classList.add("icone-like");

  btnCurtidas.append(iconeCurtida);

  let curtiu = false;

  post.likes = post.likes || []; // se for null/undefined, cria uma lista vazia --> pra não dar erro
  for (let like of post.likes) {
    if (like.usuario == idUsuario) {
      curtiu = true;
    }
  }

  iconeCurtida.classList.toggle("bi-heart-fill", curtiu);
  iconeCurtida.classList.toggle("bi-heart", !curtiu);

  let qtdCurtidas = document.createElement("span");
  qtdCurtidas.innerText = post.likes.length;
  curtidas.append(btnCurtidas, qtdCurtidas);

  btnCurtidas.addEventListener("click", (e) => {
    e.preventDefault();

    let idUsuario = localStorage.getItem("usuarioLogado");
    if (!idUsuario) {
      window.alert("Só pode curtir com um usuário logado!");
      return;
    }

    let options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        usuario: parseInt(idUsuario),
        post: post.id
      })
    };

    fetch(`${API_URL}/likes`, options)
      .then(resposta => {
        if (!resposta.ok) {
          throw new Error("Houve algum erro ao curtir/descurtir o post");
        }
        return resposta.json();
      })
      .then(dados => {
        console.log(dados.msg);

        const curtiuAgora = dados.msg.includes("adicionado"); // ver depois

        if (curtiuAgora) {
          post.likes.push({ usuario: parseInt(idUsuario) });
        } else {
          for (let i = 0; i < post.likes.length; i++) {
            if (post.likes[i].usuario == idUsuario) {
              post.likes.splice(i, 1);
              break;
            }
          }
        }

        // atualiza o icone do coração
        iconeCurtida.classList.toggle("bi-heart-fill", curtiuAgora);
        iconeCurtida.classList.toggle("bi-heart", !curtiuAgora);

        qtdCurtidas.innerText = post.likes.length;
        qtdCurtidas.innerText = post.likes.length;
      })
      .catch(erro => {
        console.error("Erro encontrado:", erro);
        window.alert("Não foi possível atualizar o like no servidor.");
      });
  });

  // COMENTARIOS 
  let comentariosDiv = document.createElement("div");
  comentariosDiv.classList.add("comentarios");

  post.comentarios = post.comentarios || [];
  for (let comentario of post.comentarios) {
    comentariosDiv.append(adicionarComentario(comentario));
  }
  let btnComentario = document.createElement("button");
  btnComentario.classList.add("btn");
  btnComentario.innerText = "Comentar";

  btnComentario.addEventListener("click", () => {
    postIdComentarioAtual = post.id;
    mostrarFormularioComentario();
  })

  novoPost.append(conteudo, curtidas, btnComentario, comentariosDiv);
  document.getElementById("listaPosts").prepend(novoPost);
}

function editarPost(id, texto, img) {
  idUsuarioPostAtual = id;
  document.querySelector("[name=textoEditarPost]").value = texto;
  document.querySelector("[name=imgEditarPost]").value = img;
  mostrarFormularioEditarPosts();

}

function deletarPost(id) {
  let idUsuario = localStorage.getItem("usuarioLogado");

  let options = {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      usuario: parseInt(idUsuario)
    })
  };

  fetch(`${API_URL}/posts/${id}`, options)
    .then(resposta => {
      if (!resposta.ok) {
        throw new Error("Erro ao deletar post");
      }
      return resposta.json();
    })
    .then(dados => {
      console.log(dados);
      window.alert("Post deletado!");
      carregarPosts();
    })
    .catch(erro => {
      console.error("Erro:", erro);
    });
}

function adicionarComentario(comentario) {

  let comentarioDiv = document.createElement("div");
  comentarioDiv.classList.add("comentario");

  let usuario = document.createElement("strong");
  usuario.innerText = nomeUsuario(comentario.usuario);

  let texto = document.createElement("span");
  texto.innerText = " " + comentario.texto;

  let data = document.createElement("small");
  data.innerText = tempoRelativo(comentario.data);
  data.classList.add("comentario-data");

  comentarioDiv.append(usuario, texto, data);

  let idUsuario = localStorage.getItem("usuarioLogado");

  if (idUsuario && idUsuario == comentario.usuario) {
    let btnEditarComentario = document.createElement("button");
    btnEditarComentario.classList.add("btn", "btn-icon"); 
    
    
    let iconeEditar = document.createElement("i");
    iconeEditar.classList.add("bi", "bi-pencil");
    btnEditarComentario.append(iconeEditar);

    btnEditarComentario.addEventListener("click", () => {
      editarComentario(comentario.id, comentario.texto);
    });

    comentarioDiv.append(btnEditarComentario);
  }

  if (idUsuario && idUsuario == comentario.usuario) {
    let btnDeletarComentario = document.createElement("button");
    btnDeletarComentario.classList.add("btn", "btn-icon"); 
    let iconeDeletarComentario = document.createElement("i");

    iconeDeletarComentario.classList.add("bi", "bi-trash3-fill"); 
    btnDeletarComentario.append(iconeDeletarComentario);

    let textoConfirmacao = document.createElement("span");
    textoConfirmacao.style.marginLeft = "5px";
    textoConfirmacao.innerText = "";
    btnDeletarComentario.append(textoConfirmacao);

    comentarioDiv.append(btnDeletarComentario);
    let confirmou = false;
    btnDeletarComentario.addEventListener("click", () => {
      if (!confirmou) {
        textoConfirmacao.innerText = "Tem certeza?";
        confirmou = true;
        return;
      }
      deletarComentario(comentario.id);
    });
  }
  return comentarioDiv;
}

function editarComentario(id, texto) {
  idComentarioAtual = id;
  document.querySelector("[name=textoEditarComentario]").value = texto;
  mostrarFormularioEditarComentario();
}

function deletarComentario(id) {

  let idUsuario = localStorage.getItem("usuarioLogado");

  let options = {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      usuario: parseInt(idUsuario)
    })
  };

  fetch(`${API_URL}/comentarios`, options)
    .then(resposta => {
      if (!resposta.ok) {
        throw new Error("Erro ao deletar comentário");
      }
      return resposta.json();
    })
    .then(dados => {
      console.log(dados);
      alert("Comentário deletado!");
      carregarPosts();
    })
    .catch(erro => {
      console.log("Erro:", erro);
    });
}

formNovoComentario.addEventListener("submit", (e) => {
  e.preventDefault();

  let inputComentario = document.querySelector("[name=textoComentario]").value;

  let idUsuario = localStorage.getItem("usuarioLogado");
  if (!idUsuario) {
    window.alert("Só pode comentar com um usuário logado!");
    return;
  }

  let options = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      usuario: parseInt(idUsuario),
      post: postIdComentarioAtual,
      texto: inputComentario
    })
  };

  console.log("Post ID:", postIdComentarioAtual);
  console.log("Usuário:", idUsuario);

  fetch(`${API_URL}/comentarios/${id}`, options)
    .then(resposta => {
      if (!resposta.ok) {
        throw new Error("Houve algum erro ao comentar no post");
      }
      return resposta.json();
    })
    .then(dados => {
      document.querySelector("[name=textoComentario]").value = "";
      mostrarBotaoNovoPost(); // esconde o formulario
      carregarPosts();
    })
    .catch(erro => {
      console.error("Erro encontrado:", erro);
    });

})

formEditarComentario.addEventListener("submit", (e) => {
  e.preventDefault();

  mostrarFormularioComentario();

  let inputEditarComentario = document.querySelector("[name=textoEditarComentario]").value;

  let idUsuario = localStorage.getItem("usuarioLogado");
  let options = {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      usuario: parseInt(idUsuario),
      texto: inputEditarComentario
    })
  };

  fetch(`${API_URL}/comentarios/${idComentarioAtual}`, options)
    .then(resposta => {
      if (!resposta.ok) {
        throw new Error("Houve algum erro ao comentar no post");
      }
      return resposta.json();
    })
    .then(dados => {
      document.querySelector("[name=textoEditarComentario]").value = "";
      mostrarBotaoNovoPost(); // esconde o formulario
      carregarPosts();
    })
    .catch(erro => {
      console.error("Erro encontrado:", erro);
    });

})

formCadastro.addEventListener("submit", (e) => {
  e.preventDefault();

  let inputNome = document.querySelector("[name=nomeCadastro]").value;
  let inputLogin = document.querySelector("[name=loginCadastro]").value;
  let inputSenha = document.querySelector("[name=senhaCadastro]").value;
  let inputImagem = document.querySelector("[name=fotoPerfil]").value;

  let usuarioExiste = false;

  for (let usuario of usuarios) {
    if (usuario.login == inputLogin) {
      usuarioExiste = true;
      break
    }
  }

  if (usuarioExiste) {
    window.alert("Esse login já existe! Tente novamente");

    document.querySelector("[name=nomeCadastro]").value = "";
    document.querySelector("[name=loginCadastro]").value = "";
    document.querySelector("[name=senhaCadastro]").value = "";
    document.querySelector("[name=fotoPerfil]").value = "";

    return; // assim o fetch não acontece 
  }

  let options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      login: inputLogin,
      nome: inputNome,
      senha: inputSenha,
      img: inputImagem || null
    })
  };

  fetch(`${API_URL}/usuarios`, options)
    .then(resposta => {
      if (!resposta.ok) {
        throw new Error("Erro na requisição");
      }
      return resposta.json();
    })

    .then(usuario => {
      console.log(usuario);
      window.alert("Usuário cadastrado!");

      document.querySelector("[name=nomeCadastro]").value = "";
      document.querySelector("[name=loginCadastro]").value = "";
      document.querySelector("[name=senhaCadastro]").value = "";
      document.querySelector("[name=fotoPerfil]").value = "";

      carregarUsuarios();
      mostrarLogin();
    })
    .catch((erro) => {
      console.error("Erro encontrado: ", erro);
    });
});

formLogin.addEventListener("submit", (e) => {
  e.preventDefault();

  let inputLogin = document.querySelector("[name=loginLogin]").value;
  let inputSenha = document.querySelector("[name=senhaLogin]").value;

  let options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      login: inputLogin,
      senha: inputSenha
    })

  }
  fetch(`${API_URL}/usuarios/login`, options)
    .then((resposta) => {
      return resposta.json();
    })
    .then((dados) => {

      if (dados.usuario) { // login deu certo
        alert(dados.msg);

        localStorage.setItem("usuarioLogado", parseInt(dados.usuario.id)); // salvar id do usuário

        mostrarBotaoNovoPost();
        atualizarDropdown(); // atualiza o menu
        carregarPosts(); // com curtidas do usuario logado 

        document.querySelector("[name=loginLogin]").value = "";
        document.querySelector("[name=senhaLogin]").value = "";

      } else { // login errado
        alert("Usuário ou senha incorretos!");
      }

    })
    .catch((erro) => {
      console.error(erro);
    });
})

formNovoPost.addEventListener("submit", (e) => {
  e.preventDefault();

  let idUsuario = localStorage.getItem("usuarioLogado");

  let textoPost = document.querySelector("[name=textoPost]").value;
  let imgPost = document.querySelector("[name=imgPost]").value;

  let options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      usuario: parseInt(idUsuario),
      texto: textoPost || null,
      img: imgPost || null
    })
  }

  if (textoPost || imgPost) {
    fetch(`${API_URL}/posts`, options)
      .then((resposta) => {
        if (!resposta.ok) {
          console.log(resposta.status);
          throw new Error("Erro na requisição");
        }
        return resposta.json();
      })
      .then((postCriado) => {
        document.querySelector("[name=textoPost]").value = "";
        document.querySelector("[name=imgPost]").value = "";

        mostrarBotaoNovoPost();

        adicionarPost(postCriado);
      })
      .catch((erro) => {
        console.error(erro);
        window.alert("Não foi possível criar o post.");
      });
  } else {
    window.alert("Não foi possível criar o post.");
    return;
  }
})

formEditarPost.addEventListener("submit", (e) => {
  e.preventDefault();
  mostrarFormularioEditarPosts();

  let inputEditarTexto = document.querySelector("[name=textoEditarPost]").value;
  let inputEditarImg = document.querySelector("[name=imgEditarPost]").value;

  let idUsuario = localStorage.getItem("usuarioLogado");
  let options = {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      usuario: parseInt(idUsuario),
      texto: inputEditarTexto,
      img: inputEditarImg
    })
  };

  fetch(`${API_URL}/posts/${idUsuarioPostAtual}`, options)
    .then(resposta => {
      if (!resposta.ok) {
        throw new Error("Houve algum erro ao comentar no post");
      }
      return resposta.json();
    })
    .then(dados => {
      document.querySelector("[name=textoEditarPost]").value = "";
      document.querySelector("[name=imgEditarPost]").value = "";

      mostrarBotaoNovoPost(); // esconde o formulario
      carregarPosts();
    })
    .catch(erro => {
      console.error("Erro encontrado:", erro);
    });

})

function esconderTudo() {
  formLogin.style.display = "none";
  formCadastro.style.display = "none";
  formNovoPost.style.display = "none";
  botaoNovoPost.style.display = "none";
  formNovoComentario.style.display = "none";
  formEditarComentario.style.display = "none";
  formEditarPost.style.display = "none";
}

function mostrarLogin() {
  esconderTudo();
  formLogin.style.display = "block";
}

function mostrarCadastro() {
  esconderTudo();
  formCadastro.style.display = "block";
}

function mostrarBotaoNovoPost() {
  esconderTudo();
  botaoNovoPost.style.display = "block";
}

function mostrarFormularioPost() {
  esconderTudo();
  formNovoPost.style.display = "block";
  botaoNovoPost.style.display = "block";
}

function mostrarFormularioEditarPosts() {
  esconderTudo();
  formEditarPost.style.display = "block";
}

function mostrarFormularioComentario() {
  esconderTudo();
  formNovoComentario.style.display = "block";
}

function mostrarFormularioEditarComentario() {
  esconderTudo();
  formEditarComentario.style.display = "block";
}

document.getElementById("btnLogout").addEventListener("click", () => {
  localStorage.removeItem("usuarioLogado");
  mostrarLogin();
  atualizarDropdown(); // menu volta ao estado inicial
  carregarPosts();
});

document.getElementById("abrirLogin").addEventListener("click", () => {
  mostrarLogin();
});

document.getElementById("abrirCadastro").addEventListener("click", () => {
  mostrarCadastro();
});

document.getElementById("abrirNovoPost").addEventListener("click", () => {
  mostrarFormularioPost();
});

// Colocar o nome de usuário 
function nomeUsuario(id) {
  for (let i = 0; i < usuarios.length; i++) {
    if (usuarios[i].id == id) {
      return usuarios[i].nome;
    }
  }
  return "Usuário";
}

function tempoRelativo(dataISO) { // chatgpt que fez
  const agora = new Date();
  const data = new Date(dataISO);

  const diffMs = agora - data; // diferença em milissegundos
  const segundos = Math.floor(diffMs / 1000);
  const minutos = Math.floor(segundos / 60);
  const horas = Math.floor(minutos / 60);
  const dias = Math.floor(horas / 24);

  if (segundos < 60) return "agora";
  if (minutos < 60) return `${minutos} min atrás`;
  if (horas < 24) return `${horas} h atrás`;
  if (dias < 7) return `${dias} dias atrás`;

  return data.toLocaleDateString("pt-BR");
}

function fotoUsuario(id) {
  for (let i = 0; i < usuarios.length; i++) {
    if (usuarios[i].id == id) {
      return usuarios[i].img || "https://i.pinimg.com/736x/21/9e/ae/219eaea67aafa864db091919ce3f5d82.jpg"; // fallback se não tiver imagem
    }
  }
  return "https://i.pinimg.com/736x/21/9e/ae/219eaea67aafa864db091919ce3f5d82.jpg";
}

function atualizarDropdown() {
  let id = localStorage.getItem("usuarioLogado");

  let cadastro = document.getElementById("abrirCadastro");
  let login = document.getElementById("abrirLogin");
  let logout = document.getElementById("btnLogout");

  if (id) {
    // Usuário logado
    cadastro.classList.add("d-none");
    login.classList.add("d-none");
    logout.classList.remove("d-none");
  } else {
    // Nenhum usuário logado
    cadastro.classList.remove("d-none");
    login.classList.remove("d-none");
    logout.classList.add("d-none");
  }
}
