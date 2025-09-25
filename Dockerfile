# Dockerfile para Painel OBS Futebol (frontend + API)
FROM node:18-alpine AS build
WORKDIR /app

# Instalar dependências
COPY package*.json ./
RUN npm ci

# Copiar código e gerar build
COPY . .
RUN npm run build

# Fase final: runtime
FROM node:18-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001

# Copiar apenas o necessário
COPY --from=build /app/package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/build ./build
COPY --from=build /app/server.js ./server.js
COPY --from=build /app/db.json ./db.json

# Expor porta da API/Frontend
EXPOSE 3001

# Healthcheck simples na API
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:${PORT}/gameState || exit 1

# Comando de inicialização
CMD ["node", "server.js"]