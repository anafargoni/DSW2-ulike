CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    login VARCHAR(255) UNIQUE NOT NULL,
    senha CHAR(60) NOT NULL,
    img VARCHAR(255),
    data TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    usuario INTEGER NOT NULL,
    texto VARCHAR(255),
    img VARCHAR(255),
    editado BOOLEAN NOT NULL DEFAULT FALSE,
    data TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuario FOREIGN KEY (usuario) REFERENCES usuarios(id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS comentarios (
    id SERIAL PRIMARY KEY,
    usuario INTEGER NOT NULL,
    post INTEGER NOT NULL,
    texto VARCHAR(255) NOT NULL,
    editado BOOLEAN NOT NULL DEFAULT FALSE,
    data TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuario FOREIGN KEY (usuario) REFERENCES usuarios(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_post FOREIGN KEY (post) REFERENCES posts(id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS likes (
    id SERIAL PRIMARY KEY,
    usuario INTEGER NOT NULL,
    post INTEGER NOT NULL,
    data TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuario FOREIGN KEY (usuario) REFERENCES usuarios(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_post FOREIGN KEY (post) REFERENCES posts(id) ON UPDATE CASCADE ON DELETE CASCADE
);

-- ========================
-- SEED INICIAL
-- ========================

-- A senha de todos esses usuários é "123456"
INSERT INTO usuarios (nome, login, senha)
VALUES
('João Silva', 'joao', '$2b$10$6exLzLK/0OvfxGIRQDq7b.JwYneYDzLgV.T.BcVPRwDRJG6Jdmb82'),
('Maria Souza', 'maria', '$2b$10$WuOOtzxSK8J55o8CqeuBROHsfDJAHAP.qTtbt1mpvz4iblkZsSJxO'),
('Carlos Lima', 'carlos', '$2b$10$AvzkulBn6HJW2oarBHcEuOHtH8ju70dfpKU39DqE1nHTcoVjmZMPK')
ON CONFLICT (login) DO NOTHING;

-- Posts
INSERT INTO posts (usuario, texto, img)
VALUES
(1, 'Primeiro post do João!', NULL),
(2, 'Maria compartilhando algo interessante.', NULL),
(3, 'Carlos chegou na rede social 🚀', NULL);

-- Comentários
INSERT INTO comentarios (usuario, post, texto)
VALUES
(2, 1, 'Muito bom, João!'),
(3, 1, 'Concordo!'),
(1, 2, 'Legal, Maria!'),
(3, 2, 'Excelente ponto!'),
(1, 3, 'Bem-vindo, Carlos!');

-- Likes
INSERT INTO likes (usuario, post)
VALUES
(2, 1),
(3, 1),
(1, 2),
(3, 2),
(1, 3),
(2, 3);