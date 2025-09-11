import React from 'react';
import { useGameState } from '../context/GameStateContext';
import RedCards from './RedCards';

function Overlay() {
  const { state } = useGameState();

  const formatTime = (minutes, seconds) => {
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatExtraTime = (extraTime) => {
    return extraTime > 0 ? `+${extraTime}` : '';
  };

  return (
    <div className="overlay-container w-screen h-screen flex flex-col items-start justify-start p-8 bg-transparent">
      {/* Home Team */}
      <div className="flex items-center mb-4">
        <div className="flex items-center bg-white rounded-lg p-3 mr-4">
          {state.homeTeam.logo && (
            <img 
              src={state.homeTeam.logo} 
              alt={state.homeTeam.name}
              className="w-16 h-16 object-contain mr-4"
            />
          )}
          <div className="text-black font-bold text-4xl mr-4">
            {state.homeTeam.name}
          </div>
        </div>
        <div className="bg-black rounded-lg px-6 py-4 mr-4">
          <div className="text-white font-black text-6xl">
            {state.homeTeam.score}
          </div>
        </div>
        <RedCards count={state.homeTeam.redCards} />
      </div>

      {/* Away Team */}
      <div className="flex items-center mb-8">
        <div className="flex items-center bg-white rounded-lg p-3 mr-4">
          {state.awayTeam.logo && (
            <img 
              src={state.awayTeam.logo} 
              alt={state.awayTeam.name}
              className="w-16 h-16 object-contain mr-4"
            />
          )}
          <div className="text-black font-bold text-4xl mr-4">
            {state.awayTeam.name}
          </div>
        </div>
        <div className="bg-black rounded-lg px-6 py-4 mr-4">
          <div className="text-white font-black text-6xl">
            {state.awayTeam.score}
          </div>
        </div>
        <RedCards count={state.awayTeam.redCards} />
      </div>

      {/* Timer Bar */}
       <div className="bg-green-500 rounded-lg px-8 py-4 flex items-center space-x-6">
         <div className="text-black font-black text-4xl">
           {state.period}
         </div>
         <div className="text-black font-black text-4xl">
           {formatTime(state.timer.minutes, state.timer.seconds)}
         </div>
         {state.extraTime > 0 && (
            <div className="text-black font-black text-4xl">
              {formatExtraTime(state.extraTime)}
            </div>
          )}
       </div>

       {/* Penalties Indicator */}
       {state.penalties?.active && (
         <div className="bg-white rounded-lg px-8 py-4 mt-4 flex items-center justify-center space-x-8">
           <div className="text-black font-black text-3xl">
             PÊNALTIS
           </div>
           <div className="flex items-center space-x-4">
             <div className="text-black font-black text-4xl">
               {state.penalties.homeScore}
             </div>
             <div className="text-black font-black text-3xl">-</div>
             <div className="text-black font-black text-4xl">
               {state.penalties.awayScore}
             </div>
           </div>
         </div>
       )}
     </div>
  );
}

export default Overlay;