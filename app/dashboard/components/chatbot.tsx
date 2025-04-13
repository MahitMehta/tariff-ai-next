'use client';

import React, { useState, useRef, useEffect } from 'react';

type Message = {
  id: number;
  content: string;
  sender: 'user' | 'ai';
  timestamp: string;
};

const sendChatMessage = async (question: string, context: string) => {
  try {
    const response = await fetch('http://localhost:8000/chat/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question,
        context
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
};

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatContext, setChatContext] = useState(
    "You are Chaewon, a financial analyst AI assistant. Provide professional, accurate responses about stocks, investments, and market trends. Keep answers concise but informative."
  );
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Adjust textarea height
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim() === '' || isLoading) return;
  
    const userMessage: Message = {
      id: Date.now(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
  
    // Add loading placeholder message
    const loadingMessage: Message = {
      id: Date.now() + 1,
      content: '...',
      sender: 'ai',
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, loadingMessage]);
  
    try {
      const response = await sendChatMessage(inputMessage, chatContext);
  
      setMessages(prev => {
        // Replace the last message (loading) with real response
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = {
          ...loadingMessage,
          content: response.answer,
          timestamp: new Date().toISOString()
        };
        return newMessages;
      });
    } catch (error) {
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = {
          ...loadingMessage,
          content: "Sorry, I couldn't process your request. Please try again.",
          timestamp: new Date().toISOString()
        };
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
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
            <p className="text-xl mb-2">Ask Chaewon</p>
            <p className="text-sm">Ask about stocks, investments, or market trends</p>
          </div>
        )}
        
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`flex ${
              message.sender === 'user' ? 'justify-end' : 'justify-start'
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
            {message.content === '...' ? (
              <span className="typing-dots inline-flex space-x-1">
                <span className="dot w-2 h-2 bg-neutral-400 rounded-full animate-bounce [animation-delay:0s]"></span>
                <span className="dot w-2 h-2 bg-neutral-400 rounded-full animate-bounce [animation-delay:0.15s]"></span>
                <span className="dot w-2 h-2 bg-neutral-400 rounded-full animate-bounce [animation-delay:0.3s]"></span>
              </span>
            ) : (
              message.content
            )}   
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
            placeholder="Ask about stocks or investments..."
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
            disabled={isLoading}
          />
          <button 
            onClick={handleSendMessage}
            disabled={inputMessage.trim() === '' || isLoading}
            className="
              bg-neutral-800 text-white p-2 rounded-lg 
              hover:bg-neutral-700 transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center justify-center mb-4
              h-10 w-10
            "
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path 
                  fillRule="evenodd" 
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" 
                  clipRule="evenodd" 
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}