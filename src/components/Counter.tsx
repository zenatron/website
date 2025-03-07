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
          className="px-4 py-2 bg-accent text-white rounded hover:bg-accent/80 transition-colors"
        >
          Increment
        </button>
        <button 
          onClick={() => setCount(count - 1)}
          className="px-4 py-2 bg-muted-text/20 rounded hover:bg-muted-text/30 transition-colors"
        >
          Decrement
        </button>
        <button 
          onClick={() => setCount(0)}
          className="px-4 py-2 bg-muted-text/20 rounded hover:bg-muted-text/30 transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
} 