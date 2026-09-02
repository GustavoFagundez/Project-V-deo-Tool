# VideoTool — backend

Servidor Node.js simples que conecta no MySQL e expõe rotas para o
front-end do VideoTool consumir no lugar do `database.json`.

## 1. Pré-requisitos

- Node.js instalado ([nodejs.org](https://nodejs.org))
- MySQL rodando com o banco `videotool` criado (use o `schema.sql` que
  você já tem)

## 2. Instalar as dependências

Dentro desta pasta, no terminal:

```
npm install
```

## 3. Configurar a conexão

Copie `.env.example` para `.env`:

```
copy .env.example .env
```

Abra o `.env` e coloque a senha real do seu MySQL (a que você definiu
na instalação/reset).

## 4. Rodar o servidor

```
npm start
```

Se tudo estiver certo, aparece:
```
VideoTool backend rodando em http://localhost:3001
```

Teste abrindo no navegador: `http://localhost:3001/api/health` — deve
mostrar `{"status":"ok","database":"connected"}`.

## 5. Rotas disponíveis

| Rota                              | O que retorna                        |
|-----------------------------------|---------------------------------------|
| `GET /api/plans`                  | Planos e seus recursos                |
| `GET /api/tools`                  | Lista de ferramentas (barra lateral)  |
| `GET /api/users/:userId/history`  | Histórico de uso do usuário           |
| `GET /api/users/:userId/images`   | Imagens salvas do usuário             |
| `GET /api/users/:userId/videos`   | Vídeos salvos do usuário              |
| `GET /api/users/:userId/tokens`   | Saldo de tokens do usuário            |

`:userId` por enquanto é fixo (ex.: `usr_001`, o mesmo do `schema.sql`)
— os `TODO`s no `server.js` marcam onde entra login/autenticação real.

## 6. Ligar ao front-end

No `scripts/app.js` do site, troque as chamadas que hoje leem
`database.json` por chamadas a essas rotas, por exemplo:

```javascript
const response = await fetch("http://localhost:3001/api/tools");
const tools = await response.json();
```
