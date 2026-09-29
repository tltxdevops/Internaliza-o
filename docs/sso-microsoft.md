# SSO Microsoft

Login só com a conta Microsoft. O navegador não usa MSAL e não vê o client secret.

## Redirect URI no Entra ID

Plataforma **Web**, tenant único da Teletex.

- Local: `http://localhost:3000/api/auth/microsoft/callback`
- Produção: `https://internaliza-o.vercel.app/api/auth/microsoft/callback`

Esse valor tem que ser idêntico em `MICROSOFT_REDIRECT_URI` e no authorize/token.

Permissões delegadas: `openid`, `profile`, `email`, `User.Read`.

## Fluxo

1. Entrar com Microsoft gera um `state` no `sessionStorage` e chama `GET /auth/microsoft/login`.
2. A API devolve `{ authUrl }` e o browser vai para a Microsoft.
3. O callback `GET` só redireciona para `/?code=...&state=...`.
4. O front confere o `state` e chama `POST /auth/microsoft/callback`.
5. A API troca o code, lê o perfil no Graph, grava o cookie `internalizacao_session` (HttpOnly) e devolve o JWT da aplicação.
6. `GET /auth/me` e as rotas `/api` exigem esse JWT no cookie ou em `Authorization: Bearer`.
7. Sair limpa o storage e chama `POST /auth/logout`.
