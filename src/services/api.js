import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const gameStateAPI = {
  // Buscar o estado atual do jogo
  getGameState: async () => {
    try {
      const response = await api.get('/gameState');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar estado do jogo:', error);
      throw error;
    }
  },

  // Atualizar o estado do jogo
  updateGameState: async (gameState) => {
    try {
      const updatedState = {
        ...gameState,
        lastUpdated: new Date().toISOString()
      };
      const response = await api.put('/gameState', updatedState);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar estado do jogo:', error);
      throw error;
    }
  },

  // Resetar o jogo para o estado inicial
  resetGameState: async () => {
    try {
      const initialState = {
        id: 1,
        homeTeam: {
          logo: null,
          name: "HOME",
          score: 0,
          redCards: 0
        },
        awayTeam: {
          logo: null,
          name: "AWAY",
          score: 0,
          redCards: 0
        },
        timer: {
          minutes: 0,
          seconds: 0,
          isRunning: false
        },
        period: "1T",
        extraTime: 0,
        penalties: {
          active: false,
          homeScore: 0,
          awayScore: 0
        },
        lastUpdated: new Date().toISOString()
      };
      const response = await api.put('/gameState', initialState);
      return response.data;
    } catch (error) {
      console.error('Erro ao resetar estado do jogo:', error);
      throw error;
    }
  }
};

export default api;