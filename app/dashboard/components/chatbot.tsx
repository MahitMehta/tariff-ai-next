'use client';

import React, { useState, useRef, useEffect } from 'react';

type Message = {
  id: number;
  content: string;
  sender: 'user' | 'ai';
  timestamp: string;
};

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const handleSendMessage = () => {
    if (inputMessage.trim() === '') return;

    const userMessage: Message = {
      id: Date.now(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputMessage('');

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    setTimeout(() => {
      const aiMessage: Message = {
        id: Date.now() + 1,
        content: `You said: "${inputMessage}". I'm a placeholder AI response that demonstrates how a longer response might look in the chat interface.`,
        sender: 'ai',
        timestamp: new Date().toISOString()
      };
      setMessages(prevMessages => [...prevMessages, aiMessage]);
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    } else if (e.key === 'Enter') {
      adjustTextareaHeight();
    }
  };

  return (
    <div className="relative flex flex-col h-screen bg-black overflow-hidden">
      <div className="absolute top-0 left-0 right-0 bg-neutral-950 p-4 text-center border-b border-neutral-900 z-10">
        <h2 className="text-lg font-semibold text-white">Ask Chaewon</h2>
      </div>

      <div 
        ref={chatContainerRef}
        className="flex-grow overflow-y-auto p-4 space-y-4 no-scrollbar pt-16 pb-16"
      >
        {messages.length === 0 && (
          <div className="text-center text-neutral-500 mt-10">
            <p className="text-xl mb-2">Welcome to AI Assistant</p>
            <p className="text-sm">Send a message to start the conversation</p>
          </div>
        )}
        
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`flex ${
              message.sender === 'user' 
                ? 'justify-end' 
                : 'justify-start'
            }`}
          >
            <div 
              className={`
                max-w-[80%] p-3 rounded-lg shadow-md
                ${
                  message.sender === 'user'
                    ? 'bg-neutral-800 text-white'
                    : 'bg-neutral-900 text-neutral-200'
                }
              `}
            >
              {message.content}
            </div>
          </div>
        ))}
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-neutral-950 p-4 border-t border-neutral-900 z-10">
        <div className="flex items-end space-x-2">
          <textarea 
            ref={textareaRef}
            value={inputMessage}
            onChange={(e) => {
              setInputMessage(e.target.value);
              adjustTextareaHeight();
            }}
            onKeyDown={handleKeyPress}
            placeholder="Message the AI assistant..."
            rows={1}
            className="
              w-full p-2 rounded-lg bg-neutral-900 text-white 
              resize-none overflow-hidden
              focus:outline-none focus:ring-2 focus:ring-neutral-700
            "
            style={{ 
              height: 'auto', 
              minHeight: '40px', 
              maxHeight: '120px' 
            }}
          />
          <button 
            onClick={handleSendMessage}
            disabled={inputMessage.trim() === ''}
            className="
              bg-neutral-800 text-white p-2 rounded-lg 
              hover:bg-neutral-700 transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center justify-center mb-4
            "
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" 
                clipRule="evenodd" 
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}