'use client';

import React, { useState } from 'react';

export default function Chatbot() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const askBot = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: input,
        }),
      });

      const data = await res.json();
      setResponse(data);
    } catch (err) {
      console.error(err);
      setResponse({ error: 'Failed to connect to the bot.' });
    }
    setLoading(false);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">Chat with Financial Bot</h2>
      <textarea 
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="w-full p-2 border rounded bg-neutral-900 text-white"
        rows={4}
        placeholder="Enter financial text..."
      />
      <button 
        onClick={askBot}
        className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded text-white"
        disabled={loading}
      >
        {loading ? 'Analyzing...' : 'Ask Bot'}
      </button>

      {response && (
        <pre className="mt-4 bg-neutral-800 p-4 rounded overflow-x-auto text-left">
          {JSON.stringify(response, null, 2)}
        </pre>
      )}
    </div>
  );
}
