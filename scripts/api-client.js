/* =========================================================
   api-client.js
   Comunicacao com o backend (Node/Express) e guarda do token de login.
   Carregue este arquivo ANTES dos scripts que fazem chamadas a API.
   ========================================================= */

// Endereco do backend. Troque aqui se mudar a porta ou for para producao.
const API_BASE_URL = "http://localhost:3001";

const TOKEN_STORAGE_KEY = "videotool-token";

function getToken() {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch (error) {
    return null;
  }
}

function setToken(token) {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

function clearToken() {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch (error) {
    // sem acesso ao localStorage: nada a limpar
  }
}

// Faz uma requisicao JSON ao backend.
//  - Devolve o JSON da resposta quando der certo.
//  - Lanca Error com a mensagem do servidor (ou uma mensagem amigavel)
//    quando falhar, pronta para ser mostrada ao usuario.
//  - Com { auth: true }, envia o token no cabecalho Authorization.
async function apiRequest(path, { method = "GET", body, auth = false } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(API_BASE_URL + path, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (networkError) {
    throw new Error("Não foi possível conectar ao servidor. Verifique se o backend está rodando.");
  }

  let data = null;
  try {
    data = await response.json();
  } catch (parseError) {
    // resposta sem corpo JSON
  }

  if (!response.ok) {
    throw new Error((data && data.message) || `Erro ${response.status} ao falar com o servidor.`);
  }
  return data;
}
