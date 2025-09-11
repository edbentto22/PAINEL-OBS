import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Overlay from './components/Overlay';
import ControlPanel from './components/ControlPanel';
import { GameStateProvider } from './context/GameStateContext';

function App() {
  return (
    <GameStateProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/overlay" element={<Overlay />} />
            <Route path="/control" element={<ControlPanel />} />
            <Route path="/" element={<ControlPanel />} />
          </Routes>
        </div>
      </Router>
    </GameStateProvider>
  );
}

export default App;