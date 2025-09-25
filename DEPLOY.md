# Deploy no GitHub + Coolify (Painel OBS Futebol)

Este guia prepara o repositório para publicação no GitHub e deploy no Coolify com um único serviço (frontend + API) em Node.

## 1) Preparos no Código (já aplicados)

- `server.js` serve o build do React e a API `json-server` na mesma porta.
- `src/services/api.js` detecta automaticamente a URL da API: em dev usa `http://localhost:3001`, em produção usa a mesma origem.
- Script de produção: `npm run start:prod` (executa build e sobe o servidor Node).
- Dockerfile pronto (build multi-stage + healthcheck).

## 2) Publicar no GitHub

1. Crie um repositório no GitHub.
2. Adicione o remote e faça push:
   - `git init`
   - `git add .`
   - `git commit -m "chore: produção pronta (server estático + Dockerfile)"`
   - `git branch -M main`
   - `git remote add origin https://github.com/<usuario>/<repositorio>.git`
   - `git push -u origin main`

## 3) Deploy no Coolify

Você pode usar o Dockerfile incluído.

### Passo a Passo

1. Acesse sua instância Coolify e clique em "Create New" > "Application".
2. Escolha "Git Repository" e conecte seu GitHub.
3. Selecione o repositório e o branch `main`.
4. Em "Deployment":
   - Build Pack: Dockerfile (automático ao detectar `Dockerfile`).
   - Port: 3001 (será mapeada automaticamente).
   - Environment Variables:
     - `NODE_ENV=production`
     - `PORT=3001`
5. Storage Persistente (opcional porém recomendado):
   - Adicione um volume persistente e monte em `/app/db.json`.
   - Isso preserva o estado do jogo entre deploys.
6. Healthcheck:
   - A imagem já possui `HEALTHCHECK` para `http://localhost:3001/gameState`.
7. Deploy:
   - Clique em "Deploy" e aguarde a conclusão.

### URL e OBS

- A aplicação ficará disponível em `https://SEU_DOMINIO` (ou subdomínio configurado).
- No OBS, adicione uma fonte "Navegador" com a URL do overlay (ex.: `https://SEU_DOMINIO/overlay`).
- O painel de controle roda na mesma origem e consome a API automaticamente.

## 4) Desenvolvimento Local

- Servidor/API: `npm run server` (porta 3001)
- Frontend dev: `npm run client` (porta 3002)
- Produção local: `npm run start:prod` (porta 3001, serve build + API)

## 5) Variáveis e Configurações

- `REACT_APP_API_BASE_URL` é opcional em produção (auto-detecta a origem).
- Em ambientes não padrão, defina `REACT_APP_API_BASE_URL` para a URL da API.

## 6) Troubleshooting

- Porta ocupada: altere `PORT` no Coolify ou libere a porta.
- API 404: confirme se `db.json` existe e se o volume está corretamente montado.
- CORS: o servidor já está com CORS aberto para produção.
- Build falhou: verifique logs de build e se devDependencies foram instaladas (Dockerfile usa multi-stage para isso).

## 7) Estrutura de Deploy

- Serviço único (Node) servindo:
  - Frontend: `/build` (arquivos estáticos)
  - API: endpoints como `/gameState`

Tudo pronto para GitHub e Coolify!