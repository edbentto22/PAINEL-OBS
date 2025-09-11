import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { gameStateAPI } from '../services/api';

const GameStateContext = createContext();

const initialState = {
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
  }
};

function gameStateReducer(state, action) {
  switch (action.type) {
    case 'UPDATE_HOME_SCORE':
      return {
        ...state,
        homeTeam: { ...state.homeTeam, score: action.payload }
      };
    case 'UPDATE_AWAY_SCORE':
      return {
        ...state,
        awayTeam: { ...state.awayTeam, score: action.payload }
      };
    case 'UPDATE_HOME_RED_CARDS':
      return {
        ...state,
        homeTeam: { ...state.homeTeam, redCards: action.payload }
      };
    case 'UPDATE_AWAY_RED_CARDS':
      return {
        ...state,
        awayTeam: { ...state.awayTeam, redCards: action.payload }
      };
    case 'UPDATE_HOME_NAME':
      return {
        ...state,
        homeTeam: { ...state.homeTeam, name: action.payload }
      };
    case 'UPDATE_AWAY_NAME':
      return {
        ...state,
        awayTeam: { ...state.awayTeam, name: action.payload }
      };
    case 'UPDATE_HOME_LOGO':
      return {
        ...state,
        homeTeam: { ...state.homeTeam, logo: action.payload }
      };
    case 'UPDATE_AWAY_LOGO':
      return {
        ...state,
        awayTeam: { ...state.awayTeam, logo: action.payload }
      };
    case 'START_TIMER':
      return {
        ...state,
        timer: { ...state.timer, isRunning: true }
      };
    case 'STOP_TIMER':
      return {
        ...state,
        timer: { ...state.timer, isRunning: false }
      };
    case 'UPDATE_TIMER':
      return {
        ...state,
        timer: { ...state.timer, ...action.payload }
      };
    case 'RESET_TIMER':
      return {
        ...state,
        timer: { minutes: 0, seconds: 0, isRunning: false }
      };
    case 'INCREMENT_TIMER':
      const newSeconds = state.timer.seconds + 1;
      const newMinutes = newSeconds >= 60 ? state.timer.minutes + 1 : state.timer.minutes;
      return {
        ...state,
        timer: {
          ...state.timer,
          minutes: newMinutes,
          seconds: newSeconds >= 60 ? 0 : newSeconds
        }
      };
    case 'UPDATE_PERIOD':
    case 'SET_PERIOD':
      return {
        ...state,
        period: action.payload
      };
    case 'UPDATE_EXTRA_TIME':
      return {
        ...state,
        extraTime: action.payload
      };
    case 'TOGGLE_PENALTIES':
      return {
        ...state,
        penalties: { ...state.penalties, active: !state.penalties.active }
      };
    case 'UPDATE_HOME_PENALTIES':
      return {
        ...state,
        penalties: { ...state.penalties, homeScore: action.payload }
      };
    case 'UPDATE_AWAY_PENALTIES':
      return {
        ...state,
        penalties: { ...state.penalties, awayScore: action.payload }
      };
    case 'LOAD_STATE':
      return action.payload;
    default:
      return state;
  }
}

export function GameStateProvider({ children }) {
  const [state, dispatch] = useReducer(gameStateReducer, initialState);
  const [isLoading, setIsLoading] = React.useState(true);
  const [lastUpdated, setLastUpdated] = React.useState(null);
  const [lastLocalUpdate, setLastLocalUpdate] = React.useState(null);
  const [skipNextPoll, setSkipNextPoll] = React.useState(false);
  const [useLocalStorage, setUseLocalStorage] = React.useState(false);

  // Funções auxiliares para localStorage
  const saveToLocalStorage = useCallback((gameState) => {
    try {
      const stateToSave = {
        ...gameState,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem('gameState', JSON.stringify(stateToSave));
      return stateToSave;
    } catch (error) {
      console.error('Erro ao salvar no localStorage:', error);
      return null;
    }
  }, []);

  const loadFromLocalStorage = useCallback(() => {
    try {
      const saved = localStorage.getItem('gameState');
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Erro ao carregar do localStorage:', error);
      return null;
    }
  }, []);

  // Função para carregar estado da API com fallback para localStorage
  const loadStateFromAPI = useCallback(async () => {
    try {
      const apiState = await gameStateAPI.getGameState();
      if (apiState) {
        // Remove campos específicos da API antes de carregar no estado
        const { id, lastUpdated: apiLastUpdated, ...gameData } = apiState;
        dispatch({ type: 'LOAD_STATE', payload: gameData });
        setLastUpdated(apiLastUpdated);
        setLastLocalUpdate(Date.now());
        setUseLocalStorage(false);
        console.log('Estado sincronizado da API - Overlay atualizado');
      }
    } catch (error) {
      console.error('API não disponível, usando localStorage:', error);
      setUseLocalStorage(true);
      
      // Fallback para localStorage
      const localState = loadFromLocalStorage();
      if (localState) {
        const { id, lastUpdated: localLastUpdated, ...gameData } = localState;
        dispatch({ type: 'LOAD_STATE', payload: gameData });
        setLastUpdated(localLastUpdated);
        setLastLocalUpdate(Date.now());
        console.log('Estado carregado do localStorage - Overlay atualizado');
      } else {
        console.log('Usando estado inicial');
      }
    } finally {
      setIsLoading(false);
    }
  }, [loadFromLocalStorage]);

  // Função para salvar estado na API com fallback para localStorage
  const saveStateToAPI = useCallback(async (currentState) => {
    if (useLocalStorage) {
      // Usar localStorage quando API não está disponível
      const savedState = saveToLocalStorage(currentState);
      if (savedState) {
        setLastUpdated(savedState.lastUpdated);
        setLastLocalUpdate(Date.now());
        console.log('Estado salvo no localStorage:', savedState);
      }
      return;
    }

    try {
      console.log('Salvando estado na API:', currentState);
      const response = await gameStateAPI.updateGameState({
        id: 1,
        ...currentState
      });
      console.log('Estado salvo com sucesso na API:', response);
      setLastUpdated(response.lastUpdated);
      setLastLocalUpdate(Date.now());
      setSkipNextPoll(true);
    } catch (error) {
      console.error('Erro ao salvar na API, usando localStorage:', error);
      setUseLocalStorage(true);
      
      // Fallback para localStorage
      const savedState = saveToLocalStorage(currentState);
      if (savedState) {
        setLastUpdated(savedState.lastUpdated);
        setLastLocalUpdate(Date.now());
        console.log('Estado salvo no localStorage (fallback):', savedState);
      }
    }
  }, [useLocalStorage, saveToLocalStorage]);

  // Carregar estado inicial da API
  useEffect(() => {
    loadStateFromAPI();
  }, [loadStateFromAPI]);

  // Salvar estado na API sempre que mudar (exceto no carregamento inicial)
  useEffect(() => {
    if (!isLoading && state !== initialState) {
      const timeoutId = setTimeout(() => {
        saveStateToAPI(state);
      }, 50); // Debounce de 50ms para resposta mais rápida
      
      return () => clearTimeout(timeoutId);
    }
  }, [state, isLoading, saveStateToAPI]);

  // Polling para sincronização (apenas quando usando API)
  useEffect(() => {
    if (useLocalStorage) {
      // Não fazer polling quando usando localStorage
      return;
    }

    const interval = setInterval(async () => {
      try {
        // Pula o polling se houve uma atualização local recente (últimos 3 segundos)
        if (skipNextPoll) {
          setSkipNextPoll(false);
          return;
        }
        
        if (lastLocalUpdate && Date.now() - lastLocalUpdate < 3000) {
          return;
        }
        
        const apiState = await gameStateAPI.getGameState();
        if (apiState && apiState.lastUpdated !== lastUpdated) {
          const { id, lastUpdated: apiLastUpdated, ...gameData } = apiState;
          dispatch({ type: 'LOAD_STATE', payload: gameData });
          setLastUpdated(apiLastUpdated);
          console.log('Estado sincronizado via polling');
        }
      } catch (error) {
        console.error('Erro no polling, mudando para localStorage:', error);
        setUseLocalStorage(true);
      }
    }, 500); // Polling mais frequente para atualizações mais rápidas

    return () => clearInterval(interval);
  }, [lastUpdated, lastLocalUpdate, skipNextPoll, useLocalStorage]);

  // Timer interval effect
  useEffect(() => {
    let interval;
    if (state.timer.isRunning) {
      interval = setInterval(() => {
        dispatch({ type: 'INCREMENT_TIMER' });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [state.timer.isRunning]);

  // Função para resetar o jogo com fallback para localStorage
  const resetGame = useCallback(async () => {
    if (useLocalStorage) {
      // Reset usando localStorage
      const resetState = {
        ...initialState,
        lastUpdated: new Date().toISOString()
      };
      const savedState = saveToLocalStorage(resetState);
      if (savedState) {
        dispatch({ type: 'LOAD_STATE', payload: initialState });
        setLastUpdated(savedState.lastUpdated);
        setLastLocalUpdate(Date.now());
        setSkipNextPoll(true);
        console.log('Jogo resetado completamente (localStorage) - Todos os dados zerados');
      }
      return;
    }

    try {
      const resetState = await gameStateAPI.resetGameState();
      const { id, lastUpdated: apiLastUpdated, ...gameData } = resetState;
      dispatch({ type: 'LOAD_STATE', payload: gameData });
      setLastUpdated(apiLastUpdated);
      setLastLocalUpdate(Date.now());
      setSkipNextPoll(true);
      console.log('Jogo resetado completamente (API) - Todos os dados zerados');
    } catch (error) {
      console.error('Erro ao resetar via API, usando localStorage:', error);
      setUseLocalStorage(true);
      
      // Fallback para localStorage
      const resetState = {
        ...initialState,
        lastUpdated: new Date().toISOString()
      };
      const savedState = saveToLocalStorage(resetState);
      if (savedState) {
        dispatch({ type: 'LOAD_STATE', payload: initialState });
        setLastUpdated(savedState.lastUpdated);
        setLastLocalUpdate(Date.now());
        setSkipNextPoll(true);
        console.log('Jogo resetado completamente (localStorage fallback) - Todos os dados zerados');
      }
    }
  }, [useLocalStorage, saveToLocalStorage]);

  // Dispatcher customizado que marca atualizações locais
  const customDispatch = useCallback((action) => {
    // Marca que houve uma atualização local para evitar conflitos com polling
    // Exclui ações relacionadas ao timer, carregamento de estado e cartões vermelhos
    const excludedActions = [
      'LOAD_STATE', 'INCREMENT_TIMER', 'START_TIMER', 'STOP_TIMER', 'RESET_TIMER'
    ];
    
    if (!excludedActions.includes(action.type)) {
      setLastLocalUpdate(Date.now());
      setSkipNextPoll(true);
      console.log('Dispatching action:', action.type, action.payload);
    }
    dispatch(action);
  }, []);

  return (
    <GameStateContext.Provider value={{
      state,
      dispatch: customDispatch,
      isLoading,
      resetGame,
      refreshState: loadStateFromAPI,
      useLocalStorage
    }}>
      {children}
    </GameStateContext.Provider>
  );
}

export function useGameState() {
  const context = useContext(GameStateContext);
  if (!context) {
    throw new Error('useGameState must be used within a GameStateProvider');
  }
  return context;
}