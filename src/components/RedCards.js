import React from 'react';

function RedCards({ count }) {
  const cards = [];
  
  for (let i = 0; i < count; i++) {
    cards.push(
      <div 
        key={i}
        className="w-4 h-6 bg-red-600 rounded-sm border border-red-700 animate-fade-in"
        style={{
          animationDelay: `${i * 0.1}s`
        }}
      >
        {/* Red card icon */}
        <div className="w-full h-full bg-gradient-to-b from-red-500 to-red-700 rounded-sm"></div>
      </div>
    );
  }

  return (
    <div className="flex space-x-1">
      {cards}
    </div>
  );
}

export default RedCards;