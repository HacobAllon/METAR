import React from 'react';
import MetarRPLL from './VATPHILAIO';
import './src/assets/App.css';

function App() {
  // Safely get the airport from env, fallback to 'RPLL'
  const airport = import.meta.env.VITE_AIRPORT || 'RPLL';

  return (
    <div>
      <h1>METAR for {airport}</h1>
      <MetarRPLL />
    </div>
  );
}

export default App;

