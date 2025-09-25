import React, { useRef } from 'react';
import { useGameState } from '../context/GameStateContext';

function ControlPanel() {
  const { state, dispatch, isLoading, resetGame, refreshState, useLocalStorage } = useGameState();
  const homeLogoRef = useRef();
  const awayLogoRef = useRef();

  // Redimensiona e comprime a imagem para evitar estouro do localStorage e melhorar performance
  const processImage = async (file, maxDim = 256, mime = 'image/png', quality = 0.85) => {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const { width, height } = img;
            const scale = Math.min(1, maxDim / Math.max(width, height));
            const newW = Math.max(1, Math.round(width * scale));
            const newH = Math.max(1, Math.round(height * scale));
            canvas.width = newW;
            canvas.height = newH;
            ctx.drawImage(img, 0, 0, newW, newH);
            try {
              const dataUrl = canvas.toDataURL(mime, quality);
              resolve(dataUrl);
            } catch (err) {
              reject(err);
            }
          };
          img.onerror = reject;
          img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      } catch (err) {
        reject(err);
      }
    });
  };

  const handleLogoUpload = async (team, file) => {
    if (file && file.type.startsWith('image/')) {
      try {
        // Compressão básica para manter tamanho controlado no localStorage
        const optimizedDataUrl = await processImage(file, 256, file.type.includes('jpeg') || file.type.includes('jpg') ? 'image/jpeg' : 'image/png', 0.85);
        dispatch({
          type: team === 'home' ? 'UPDATE_HOME_LOGO' : 'UPDATE_AWAY_LOGO',
          payload: optimizedDataUrl
        });
      } catch (e) {
        // Fallback: se der erro ao processar, tenta salvar original (pode falhar por tamanho)
        const reader = new FileReader();
        reader.onload = (ev) => {
          dispatch({
            type: team === 'home' ? 'UPDATE_HOME_LOGO' : 'UPDATE_AWAY_LOGO',
            payload: ev.target.result
          });
        };
        reader.readAsDataURL(file);
      }
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

  const updateRedCards = (team, value) => {
    const newCards = Math.max(0, Math.min(11, value));
    
    dispatch({
      type: team === 'home' ? 'UPDATE_HOME_RED_CARDS' : 'UPDATE_AWAY_RED_CARDS',
      payload: newCards
    });
  };

  // Removido: incrementRedCards (não utilizado)

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
      type: 'RESET_TIMER'
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
        <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">
          Painel de Controle - Transmissão de Futebol
        </h1>
        
        {/* Status da Conexão */}
        <div className="mb-6 text-center">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            useLocalStorage 
              ? 'bg-yellow-100 text-yellow-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              useLocalStorage ? 'bg-yellow-500' : 'bg-green-500'
            }`}></div>
            {useLocalStorage ? 'Modo Offline (localStorage)' : 'Conectado à API'}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Home Team - Left Column */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">Time da Casa (Esquerda)</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo do Time
                </label>
                <div className="flex items-center gap-3">
                  {state.homeTeam.logo && (
                    <img src={state.homeTeam.logo} alt="Home team logo" className="w-16 h-16 object-contain rounded-full ring-2 ring-gray-200" />
                  )}
                  <input
                    ref={homeLogoRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleLogoUpload('home', e.target.files[0])}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => homeLogoRef.current?.click()}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    <span className="text-gray-500">⭱</span>
                    Upload
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome/Sigla
                </label>
                <input
                  type="text"
                  value={state.homeTeam.name}
                  onChange={(e) => updateTeamName('home', e.target.value)}
                  maxLength={4}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Máximo 4 caracteres</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Placar
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateScore('home', -1)}
                    className="px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-xl font-bold"
                  >
                    −
                  </button>
                  <span className="text-4xl font-bold w-20 text-center bg-gray-100 py-3 rounded-lg border border-gray-200">{state.homeTeam.score}</span>
                  <button
                    onClick={() => updateScore('home', 1)}
                    className="px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-xl font-bold"
                  >
                    +
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
                      className={`px-3 py-1.5 text-sm rounded-md ${
                        state.homeTeam.redCards === count
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Central Controls - Middle Column */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">Controle do Cronômetro</h2>
            
            <div className="text-center mb-6">
              <div className="text-6xl font-bold text-gray-800 mb-4 bg-gray-100 py-4 rounded-lg">
                {formatTime(state.timer.minutes, state.timer.seconds)}
              </div>
              <div className="flex justify-center space-x-2 mb-4">
                <button
                  onClick={toggleTimer}
                  className={`px-6 py-3 rounded-lg font-medium text-lg ${
                    state.timer.isRunning
                      ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                >
                  {state.timer.isRunning ? '⏸️ Pausar' : '▶️ Iniciar'}
                </button>
                <button
                  onClick={resetTimer}
                  className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium text-lg"
                >
                  🔄 Reset
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minutos
                </label>
                <div className="flex items-center justify-center space-x-2">
                  <button
                    onClick={() => updateTimer('minutes', -1)}
                    className="px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-lg"
                  >
                    −
                  </button>
                  <span className="text-2xl font-bold w-16 text-center bg-gray-100 py-2 rounded border border-gray-200">{state.timer.minutes}</span>
                  <button
                    onClick={() => updateTimer('minutes', 1)}
                    className="px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-lg"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="text-center">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Segundos
                </label>
                <div className="flex items-center justify-center space-x-2">
                  <button
                    onClick={() => updateTimer('seconds', -1)}
                    className="px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-lg"
                  >
                    −
                  </button>
                  <span className="text-2xl font-bold w-16 text-center bg-gray-100 py-2 rounded border border-gray-200">{state.timer.seconds}</span>
                  <button
                    onClick={() => updateTimer('seconds', 1)}
                    className="px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-lg"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-700 mb-3 text-center">Tempo de Jogo</h3>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => dispatch({ type: 'UPDATE_PERIOD', payload: '1T' })}
                    className={`px-6 py-3 rounded-lg font-medium ${
                      state.period === '1T'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    1º Tempo
                  </button>
                  <button
                    onClick={() => dispatch({ type: 'UPDATE_PERIOD', payload: '2T' })}
                    className={`px-6 py-3 rounded-lg font-medium ${
                      state.period === '2T'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    2º Tempo
                  </button>
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-700 mb-3">Acréscimos</h3>
                <div className="flex items-center justify-center space-x-2">
                  <button
                    onClick={() => updateExtraTime(-1)}
                    className="px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-lg"
                  >
                    −
                  </button>
                  <span className="text-3xl font-bold w-20 text-center bg-gray-100 py-2 rounded border border-gray-200">+{state.extraTime}</span>
                  <button
                    onClick={() => updateExtraTime(1)}
                    className="px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-lg"
                  >
                    +
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-2">0 a 15 minutos</p>
              </div>
            </div>
          </div>

          {/* Away Team - Right Column */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">Time Visitante (Direita)</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo do Time
                </label>
                <div className="flex items-center gap-3">
                  {state.awayTeam.logo && (
                    <img src={state.awayTeam.logo} alt="Away team logo" className="w-16 h-16 object-contain rounded-full ring-2 ring-gray-200" />
                  )}
                  <input
                    ref={awayLogoRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleLogoUpload('away', e.target.files[0])}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => awayLogoRef.current?.click()}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    <span className="text-gray-500">⭱</span>
                    Upload
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome/Sigla
                </label>
                <input
                  type="text"
                  value={state.awayTeam.name}
                  onChange={(e) => updateTeamName('away', e.target.value)}
                  maxLength={4}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Máximo 4 caracteres</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Placar
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateScore('away', -1)}
                    className="px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-xl font-bold"
                  >
                    −
                  </button>
                  <span className="text-4xl font-bold w-20 text-center bg-gray-100 py-3 rounded-lg border border-gray-200">{state.awayTeam.score}</span>
                  <button
                    onClick={() => updateScore('away', 1)}
                    className="px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-xl font-bold"
                  >
                    +
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
                      className={`px-3 py-1.5 text-sm rounded-md ${
                        state.awayTeam.redCards === count
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
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
              className={`px-6 py-3 rounded-lg font-medium ${state.penalties?.active ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
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