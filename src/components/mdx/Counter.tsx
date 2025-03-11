'use client';

import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div className="p-4 border border-accent/30 rounded-lg my-4 bg-accent/5">
      <p className="text-lg font-semibold mb-2">Count: {count}</p>
      <div className="flex gap-2">
        <button 
          onClick={() => setCount(count + 1)}
          className="px-4 py-2 bg-accent rounded hover:bg-accent/80 transition-colors"
        >
          {"+1"}
        </button>
        <button 
          onClick={() => setCount(count - 1)}
          className="px-4 py-2 bg-accent rounded hover:bg-accent/80 transition-colors"
        >
          {"-1"}
        </button>
        <button 
          onClick={() => setCount(0)}
          className="px-4 py-2 bg-accent rounded hover:bg-accent/80 transition-colors"
        >
          {"Reset"}
        </button>
      </div>
    </div>
  );
} 