# Sistema de Overlay para Transmissões de Futebol - OBS Studio

Sistema completo de overlay para transmissões de futebol compatível com OBS Studio, desenvolvido em React com sincronização em tempo real.

## 🚀 Funcionalidades

### Overlay Transparente (/overlay)
- ✅ Fundo completamente transparente para OBS
- ✅ Layout moderno com times posicionados horizontalmente
- ✅ Placar centralizado entre os times
- ✅ Cronômetro com contagem automática
- ✅ Indicadores de tempo (1T/2T) e acréscimos
- ✅ Sistema de cartões vermelhos com animações
- ✅ Logos dos times personalizáveis

### Painel de Controle (/control)
- ✅ Interface web moderna e responsiva
- ✅ Upload de logos dos times
- ✅ Controle de placar (0-99)
- ✅ Cronômetro com play/pause/reset
- ✅ Ajuste manual de minutos e segundos
- ✅ Seleção de período (1T/2T)
- ✅ Controle de acréscimos (0-15 min)
- ✅ Sistema de cartões vermelhos (0-4 por time)

### Tecnologias
- ✅ React 18 com Hooks
- ✅ Tailwind CSS para estilização
- ✅ React Router para navegação
- ✅ LocalStorage para sincronização entre páginas
- ✅ Sincronização em tempo real

## 🎯 Como Usar

### 1. Instalação
```bash
npm install
npm start
```

### 2. URLs do Sistema
- **Painel de Controle**: http://localhost:3000/control
- **Overlay para OBS**: http://localhost:3000/overlay

### 3. Configuração no OBS Studio
1. Adicione uma fonte "Browser Source"
2. Configure a URL: `http://localhost:3000/overlay`
3. Defina as dimensões:
   - Largura: 1920
   - Altura: 1080
4. Marque "Shutdown source when not visible" e "Refresh browser when scene becomes active"

### 4. Operação
1. Abra o painel de controle em `http://localhost:3000/control`
2. Configure os times (logos, nomes, placares)
3. Controle o cronômetro (iniciar/pausar/resetar)
4. Ajuste período e acréscimos conforme necessário
5. Gerencie cartões vermelhos
6. As mudanças aparecem instantaneamente no overlay

## 📋 Funcionalidades Detalhadas

### Times
- **Logos**: Upload de imagens (PNG, JPG, SVG)
- **Nomes**: Máximo 4 caracteres
- **Placar**: 0-99 pontos
- **Cartões**: 0-4 cartões vermelhos por time

### Cronômetro
- **Formato**: MM:SS (00:00 a 99:59)
- **Controles**: Play, Pause, Reset
- **Ajuste Manual**: Minutos e segundos independentes
- **Auto-incremento**: Contagem automática quando ativo

### Indicadores
- **Período**: 1º Tempo ou 2º Tempo
- **Acréscimos**: +0 a +15 minutos
- **Status**: Indicador visual quando cronômetro está rodando

### Sincronização
- **Tempo Real**: Mudanças instantâneas entre painel e overlay
- **Persistência**: Dados salvos automaticamente
- **Multi-aba**: Funciona em múltiplas abas/janelas

## 🎨 Design

### Overlay
- Fundo transparente para integração perfeita
- Tipografia moderna e legível
- Animações suaves e não intrusivas
- Otimizado para resolução 1920x1080

### Painel de Controle
- Interface limpa e organizada
- Feedback visual imediato
- Design responsivo
- Controles intuitivos

## 🔧 Estrutura do Projeto

```
src/
├── components/
│   ├── Overlay.js          # Componente do overlay transparente
│   ├── ControlPanel.js     # Painel de controle principal
│   └── RedCards.js         # Componente dos cartões vermelhos
├── context/
│   └── GameStateContext.js # Gerenciamento de estado global
├── App.js                  # Componente principal com roteamento
├── index.js               # Ponto de entrada da aplicação
└── index.css              # Estilos globais e Tailwind
```

## 📱 Responsividade

- **Desktop**: Experiência completa
- **Tablet**: Interface adaptada
- **Mobile**: Funcionalidade básica mantida

## 🚀 Performance

- Otimizado para streaming
- Sincronização eficiente
- Animações suaves
- Carregamento rápido

## 🔄 Sincronização

O sistema usa localStorage com eventos de storage para sincronização em tempo real entre o painel de controle e o overlay, garantindo que todas as mudanças sejam refletidas instantaneamente.

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique se o servidor está rodando
2. Confirme as URLs no OBS
3. Teste a sincronização entre as páginas
4. Verifique o console do navegador para erros

---

**Desenvolvido para transmissões profissionais de futebol com OBS Studio**