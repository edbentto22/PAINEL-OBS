import React, { useRef } from 'react';
import { useGameState } from '../context/GameStateContext';

function ControlPanel() {
  const { state, dispatch, isLoading, resetGame, refreshState } = useGameState();
  const homeLogoRef = useRef();
  const awayLogoRef = useRef();

  const handleLogoUpload = (team, file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        dispatch({
          type: team === 'home' ? 'UPDATE_HOME_LOGO' : 'UPDATE_AWAY_LOGO',
          payload: e.target.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const updateScore = (team, increment) => {
    const currentScore = team === 'home' ? state.homeTeam.score : state.awayTeam.score;
    const newScore = Math.max(0, currentScore + increment);
    
    dispatch({
      type: team === 'home' ? 'UPDATE_HOME_SCORE' : 'UPDATE_AWAY_SCORE',
      payload: newScore
    });
  };

  const updateTeamName = (team, name) => {
    dispatch({
      type: team === 'home' ? 'UPDATE_HOME_NAME' : 'UPDATE_AWAY_NAME',
      payload: name.slice(0, 4).toUpperCase()
    });
  };

  const updateRedCards = (team, increment) => {
    const currentCards = team === 'home' ? state.homeTeam.redCards : state.awayTeam.redCards;
    const newCards = Math.max(0, Math.min(11, currentCards + increment));
    
    dispatch({
      type: team === 'home' ? 'UPDATE_HOME_RED_CARDS' : 'UPDATE_AWAY_RED_CARDS',
      payload: newCards
    });
  };

  const updateTimer = (field, increment) => {
    const currentValue = state.timer[field];
    let newValue;
    
    if (field === 'minutes') {
      newValue = Math.max(0, Math.min(99, currentValue + increment));
    } else {
      newValue = Math.max(0, Math.min(59, currentValue + increment));
    }
    
    dispatch({
      type: 'UPDATE_TIMER',
      payload: { [field]: newValue }
    });
  };

  const toggleTimer = () => {
    dispatch({
      type: state.timer.isRunning ? 'STOP_TIMER' : 'START_TIMER'
    });
  };

  const resetTimer = () => {
    dispatch({
      type: 'UPDATE_TIMER',
      payload: { minutes: 0, seconds: 0, isRunning: false }
    });
  };

  const updateExtraTime = (increment) => {
    const newValue = Math.max(0, Math.min(15, state.extraTime + increment));
    dispatch({
      type: 'UPDATE_EXTRA_TIME',
      payload: newValue
    });
  };

  const togglePenalties = () => {
    dispatch({ type: 'TOGGLE_PENALTIES' });
  };

  const updatePenaltyScore = (team, increment) => {
    const currentScore = team === 'home' ? state.penalties.homeScore : state.penalties.awayScore;
    const newScore = Math.max(0, currentScore + increment);
    
    dispatch({
      type: team === 'home' ? 'UPDATE_HOME_PENALTIES' : 'UPDATE_AWAY_PENALTIES',
      payload: newScore
    });
  };

  const formatTime = (minutes, seconds) => {
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Painel de Controle - Transmissão de Futebol
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Home Team */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Time da Casa (Esquerda)</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo do Time
                </label>
                <input
                  ref={homeLogoRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleLogoUpload('home', e.target.files[0])}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {state.homeTeam.logo && (
                  <img src={state.homeTeam.logo} alt="Home team logo" className="mt-2 w-16 h-16 object-contain" />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome/Sigla (máx 4 chars)
                </label>
                <input
                  type="text"
                  value={state.homeTeam.name}
                  onChange={(e) => updateTeamName('home', e.target.value)}
                  maxLength={4}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Placar
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateScore('home', -1)}
                    className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    ▼
                  </button>
                  <span className="text-2xl font-bold w-12 text-center">{state.homeTeam.score}</span>
                  <button
                    onClick={() => updateScore('home', 1)}
                    className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    ▲
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cartões Vermelhos
                </label>
                <div className="flex space-x-2">
                  {[0, 1, 2, 3, 4].map(count => (
                    <button
                      key={count}
                      onClick={() => updateRedCards('home', count)}
                      className={`px-3 py-2 rounded ${
                        state.homeTeam.redCards === count
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Away Team */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Time Visitante (Direita)</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo do Time
                </label>
                <input
                  ref={awayLogoRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleLogoUpload('away', e.target.files[0])}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {state.awayTeam.logo && (
                  <img src={state.awayTeam.logo} alt="Away team logo" className="mt-2 w-16 h-16 object-contain" />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome/Sigla (máx 4 chars)
                </label>
                <input
                  type="text"
                  value={state.awayTeam.name}
                  onChange={(e) => updateTeamName('away', e.target.value)}
                  maxLength={4}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Placar
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateScore('away', -1)}
                    className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    ▼
                  </button>
                  <span className="text-2xl font-bold w-12 text-center">{state.awayTeam.score}</span>
                  <button
                    onClick={() => updateScore('away', 1)}
                    className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    ▲
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cartões Vermelhos
                </label>
                <div className="flex space-x-2">
                  {[0, 1, 2, 3, 4].map(count => (
                    <button
                      key={count}
                      onClick={() => updateRedCards('away', count)}
                      className={`px-3 py-2 rounded ${
                        state.awayTeam.redCards === count
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timer and Game Controls */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timer */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Cronômetro</h2>
            
            <div className="text-center mb-4">
              <div className="text-4xl font-bold text-gray-800 mb-2">
                {formatTime(state.timer.minutes, state.timer.seconds)}
              </div>
              <div className="flex justify-center space-x-2">
                <button
                  onClick={toggleTimer}
                  className={`px-4 py-2 rounded font-medium ${
                    state.timer.isRunning
                      ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                >
                  {state.timer.isRunning ? '⏸️ Pausar' : '▶️ Iniciar'}
                </button>
                <button
                  onClick={resetTimer}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  🔄 Reset
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minutos
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateTimer('minutes', -1)}
                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    ▼
                  </button>
                  <span className="text-xl font-bold w-12 text-center">{state.timer.minutes}</span>
                  <button
                    onClick={() => updateTimer('minutes', 1)}
                    className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    ▲
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Segundos
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateTimer('seconds', -1)}
                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    ▼
                  </button>
                  <span className="text-xl font-bold w-12 text-center">{state.timer.seconds}</span>
                  <button
                    onClick={() => updateTimer('seconds', 1)}
                    className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    ▲
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Period */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Tempo de Jogo</h2>
            
            <div className="space-y-4">
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="period"
                    value="1T"
                    checked={state.period === "1T"}
                    onChange={(e) => dispatch({ type: 'SET_PERIOD', payload: e.target.value })}
                    className="mr-2"
                  />
                  1º Tempo
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="period"
                    value="2T"
                    checked={state.period === "2T"}
                    onChange={(e) => dispatch({ type: 'SET_PERIOD', payload: e.target.value })}
                    className="mr-2"
                  />
                  2º Tempo
                </label>
              </div>
            </div>
          </div>

          {/* Extra Time */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Acréscimos</h2>
            
            <div className="flex items-center justify-center space-x-2">
              <button
                onClick={() => updateExtraTime(-1)}
                className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                ▼
              </button>
              <span className="text-2xl font-bold w-16 text-center">+{state.extraTime}</span>
              <button
                onClick={() => updateExtraTime(1)}
                className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                ▲
              </button>
            </div>
            <p className="text-sm text-gray-600 text-center mt-2">minutos</p>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Instruções para OBS</h3>
          <p className="text-blue-700">
            Para usar no OBS Studio, adicione uma fonte "Browser" e use a URL: 
            <code className="bg-blue-100 px-2 py-1 rounded ml-1">
              http://localhost:3000/overlay
            </code>
          </p>
          <p className="text-blue-700 mt-2">
            Certifique-se de que a largura seja 1920 e altura 1080 para melhor qualidade.
          </p>
        </div>

        {/* Penalty Controls */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Controle de Pênaltis</h2>
          
          <div className="text-center mb-4">
            <button
              onClick={togglePenalties}
              className={`px-6 py-3 rounded-lg font-medium ${
                state.penalties?.active
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              {state.penalties?.active ? 'Desativar Pênaltis' : 'Ativar Pênaltis'}
            </button>
          </div>

          {state.penalties?.active && (
            <div className="grid grid-cols-2 gap-6">
              {/* Home Team Penalties */}
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-700 mb-2">{state.homeTeam.name}</h3>
                <div className="flex items-center justify-center space-x-2">
                  <button
                    onClick={() => updatePenaltyScore('home', -1)}
                    className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    ▼
                  </button>
                  <span className="text-3xl font-bold w-16 text-center">{state.penalties?.homeScore || 0}</span>
                  <button
                    onClick={() => updatePenaltyScore('home', 1)}
                    className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    ▲
                  </button>
                </div>
              </div>

              {/* Away Team Penalties */}
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-700 mb-2">{state.awayTeam.name}</h3>
                <div className="flex items-center justify-center space-x-2">
                  <button
                    onClick={() => updatePenaltyScore('away', -1)}
                    className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    ▼
                  </button>
                  <span className="text-3xl font-bold w-16 text-center">{state.penalties?.awayScore || 0}</span>
                  <button
                    onClick={() => updatePenaltyScore('away', 1)}
                    className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    ▲
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Controles de Sincronização */}
      <div className="sync-controls">
        <h3>Sincronização</h3>
        <div className="sync-buttons">
          <button 
            onClick={refreshState}
            disabled={isLoading}
            className="refresh-btn"
          >
            {isLoading ? 'Carregando...' : 'Atualizar Estado'}
          </button>
          <button 
            onClick={resetGame}
            disabled={isLoading}
            className="reset-btn"
          >
            Resetar Jogo
          </button>
        </div>
        {isLoading && <div className="loading-indicator">Sincronizando...</div>}
      </div>
      
      <style>{`
         .sync-controls {
           background: #2a2a2a;
           padding: 20px;
           border-radius: 8px;
           margin-top: 20px;
         }
         
         .sync-controls h3 {
           color: #fff;
           margin-bottom: 15px;
           text-align: center;
         }
         
         .sync-buttons {
           display: flex;
           gap: 10px;
           justify-content: center;
         }
         
         .refresh-btn, .reset-btn {
           padding: 10px 20px;
           border: none;
           border-radius: 5px;
           cursor: pointer;
           font-weight: bold;
           transition: all 0.3s ease;
         }
         
         .refresh-btn {
           background: #007bff;
           color: white;
         }
         
         .refresh-btn:hover:not(:disabled) {
           background: #0056b3;
         }
         
         .reset-btn {
           background: #dc3545;
           color: white;
         }
         
         .reset-btn:hover:not(:disabled) {
           background: #c82333;
         }
         
         .refresh-btn:disabled, .reset-btn:disabled {
           opacity: 0.6;
           cursor: not-allowed;
         }
         
         .loading-indicator {
           text-align: center;
           color: #ffc107;
           margin-top: 10px;
           font-style: italic;
         }
       `}</style>
    </div>
  );
}

export default ControlPanel;