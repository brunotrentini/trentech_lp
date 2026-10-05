# TRENTECH

Landing page institucional da TRENTECH, feita em HTML, CSS e JavaScript, sem etapa de build.

## Rodar localmente

```sh
npm run dev
```

Abra http://localhost:3010.

## Deploy na VPS

Requer Docker Engine e Docker Compose.

Primeira instalação:

```sh
git clone -b v1 https://github.com/brunotrentini/trentech_lp.git trentech-lp
cd trentech-lp
docker compose up -d --build
```

Para atualizar depois:

```sh
./update.sh
```

A aplicação escuta na porta 3010 do host, para o Caddy encaminhar o domínio.

## Contatos

Os links de contato são definidos em `config.js`.
