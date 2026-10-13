# VideoTool — backend

Servidor Node.js simples que conecta no MySQL e expõe rotas para o
front-end do VideoTool consumir.

## 1. Pré-requisitos

- Node.js instalado ([nodejs.org](https://nodejs.org))
- MySQL rodando

## 2. Criar o banco de dados

Execute o script `database/DataBase.sql`. Ele cria o banco `videotool`,
as tabelas e os dados de exemplo:

```
mysql -u root -p --default-character-set=utf8mb4 -e "source database/DataBase.sql"
```

Rode na pasta raiz do projeto. O `--default-character-set=utf8mb4` evita
que acentos (como em "Usuário Exemplo") fiquem corrompidos no banco.

> O script usa `CREATE TABLE` sem `IF NOT EXISTS`. Para rodar de novo,
> apague o banco antes: `DROP DATABASE videotool;`

## 3. Instalar as dependências

Na pasta raiz do projeto (onde está o `package.json`):

```
npm install
```

## 4. Configurar a conexão

Copie `.env.example` para `.env`:

```
copy .env.example .env      (Windows)
cp .env.example .env        (Linux/macOS)
```

Abra o `.env` e ajuste os dados do seu MySQL: principalmente
`DB_PASSWORD` (a senha que você definiu na instalação) e `DB_PORT`
(a padrão do MySQL é 3306).

Preencha também o `JWT_SECRET`, segredo que assina os tokens de login.
O servidor não inicia sem ele. Para gerar um valor aleatório:

```
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

O `.env` está no `.gitignore`. Nunca faça commit dele.

## 5. Rodar o servidor

Sempre a partir da pasta raiz do projeto (é de lá que o `.env` é lido):

```
npm start
```

Se tudo estiver certo, aparece:
```
VideoTool backend rodando em http://localhost:3001
```

Teste abrindo no navegador: `http://localhost:3001/api/health` — deve
mostrar `{"status":"ok","database":"connected"}`.

## 6. Rotas disponíveis

| Rota                              | O que retorna                        |
|-----------------------------------|---------------------------------------|
| `GET /api/health`                 | Status do servidor e do banco         |
| `POST /api/auth/register`         | Cria a conta e já devolve o token     |
| `POST /api/auth/login`            | Valida e-mail/senha e devolve o token |
| `GET /api/plans`                  | Planos e seus recursos                |
| `GET /api/tools`                  | Lista de ferramentas (barra lateral)  |
| `GET /api/users/:userId/history`  | Histórico de uso do usuário           |
| `GET /api/users/:userId/images`   | Imagens salvas do usuário             |
| `GET /api/users/:userId/videos`   | Vídeos salvos do usuário              |
| `GET /api/users/:userId/tokens`   | Saldo de tokens do usuário            |

`:userId` por enquanto é fixo (ex.: `usr_001`, o mesmo do
`database/DataBase.sql`) e essas rotas ainda **não exigem login**.
Protegê-las com o token é o próximo passo.

### Login e cadastro

`POST /api/auth/register` (`name`, `email`, `password`) e
`POST /api/auth/login` (`email`, `password`) respondem com
`{ "token": "...", "user": { ... } }`. O front-end guarda o token no
`localStorage` (chave `videotool-token`, ver `scripts/api-client.js`).
A senha precisa ter pelo menos 8 caracteres.

Usuário de exemplo criado pelo `DataBase.sql`:

- E-mail: `usuario@exemplo.com`
- Senha: `senha12345`

## 7. Ligar ao front-end

O `scripts/app.js` ainda tenta ler `database/database.json`, arquivo que
não existe mais. Troque `loadDatabase()` por chamadas a essas rotas, por
exemplo:

```javascript
const response = await fetch("http://localhost:3001/api/tools");
const tools = await response.json();
```
