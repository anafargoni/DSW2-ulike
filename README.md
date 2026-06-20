# Rede Social Backend

> Repositório contendo um Backend didático de uma rede social.

### Avisos

Usar apenas para desenvolvimento local. Adaptações são necessárias caso deseje publicar o website em produção.

## 💻 Pré-requisitos

Antes de começar, verifique que sua máquina possua:

- Docker

## 🚀 Executando

Com o terminal (ou prompt de comando), entre na pasta do repositório e digite o seguinte comando:

```
docker compose up --build -d
```

## Reiniciando o servidor

Caso queira reiniciar o servidor em algum momento, sem perder os arquivos desenvolvidos, execute os seguintes comandos...

```
docker compose down -v
docker compose up --build -d
```

## Desenvolvimento do frontend

Coloque os arquivos desenvolvidos na pasta `/frontend`, incluindo arquivos CSS, JS e etc. Lembre-se que a página inicial deve se chamar `index.html`.


## ☕ Endereços para acesso

A documentação do backend pode ser acessada no endereço abaixo:

```
http://localhost:8080/documentacao.html
```

A página inicial do website pode ser encontrada em:

```
http://localhost:8080
```

O endereço base para o backend é:
```
http://localhost:3000
```
