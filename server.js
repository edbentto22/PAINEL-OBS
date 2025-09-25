const jsonServer = require('json-server');
const path = require('path');
const fs = require('fs');

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));

// Middlewares padrão + static do build
const middlewares = jsonServer.defaults({
  // Serve os arquivos estáticos gerados pelo React (build)
  static: path.join(__dirname, 'build')
});

// CORS amplo
server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

server.use(middlewares);

// Monta o roteador do json-server (endpoints como /gameState)
server.use(router);

// Fallback do React Router: envia index.html para qualquer rota não tratada pela API
server.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'build', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Build não encontrado. Rode "npm run build" primeiro.');
  }
});

// Porta
const port = process.env.PORT || 3001;

server.listen(port, () => {
  console.log(`🚀 Servidor rodando na porta ${port}`);
  console.log(`📡 API disponível em: http://localhost:${port}/gameState`);
  console.log(`🖥️  Frontend servido a partir de /build no mesmo host/porta`);
});