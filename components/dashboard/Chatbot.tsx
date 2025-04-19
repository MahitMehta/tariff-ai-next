'use client';

import { useState, useRef, useEffect } from 'react';
import { m, motion } from 'framer-motion';
import { useAtom } from 'jotai';
import { chatContextAtom } from '@/lib/atom';
import ChatMessage from './ChatMessage';

export type IMessage = {
  id: number;
  content: string;
  sender: 'user' | 'ai';
  timestamp: string;
  isAnimating?: boolean;
};

const sendChatMessage = async (
  question: string, 
  context: string, 
  previousMessages: { role: 'user' | 'ai'; message: string }[]
): Promise<{ answer: string }> => {
  // Validate input
  if (!question.trim()) {
    throw new Error('Question cannot be empty');
  }

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: question.trim(),
        context: context.trim() || '',
        previousMessages
      }),
      signal: AbortSignal.timeout(30000)
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorBody}`);
    }

    const data = await response.json();
  
    
    if (!data || !data.answer) {
      throw new Error('Invalid response from server');
    }

    let answer = (data.answer ?? '').toString().trim();
    answer = answer.replace(/\s*undefined\s*$/im, '').trim();

    return {
      answer: answer || 'I apologize, but I could not generate a response.'
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      console.error('Request timed out');
      throw new Error('The request took too long. Please try again.');
    }

    if (error instanceof TypeError) {
      console.error('Network error:', error);
      throw new Error('Network error. Please check your connection.');
    }

    console.error('Chat message error:', error);
    throw error;
  }
};

export default function Chatbot() {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatContext, setChatContext] = useAtom(chatContextAtom);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContext) {
      textareaRef.current?.focus();

      const contextMessage: IMessage = {
        id: Date.now(),
        content: "Report Imported.",
        sender: 'user',
        timestamp: new Date().toISOString(),
        isAnimating: true
      };

      setMessages(prevMessages => [...prevMessages, contextMessage]);

      chatBottomRef.current?.scrollIntoView({ 
        behavior: 'smooth',
      });

      sendChatMessage(
        "Provide a response asking the user to ask about stocks, investments, or market trends (30 WORDS MAX).", 
        chatContext,
        []
      ).then((response) => {
        const aiMessage: IMessage = {
          id: Date.now(),
          content: response.answer,
          sender: 'ai',
          timestamp: new Date().toISOString(),
          isAnimating: true
        };

        setMessages(prevMessages => [...prevMessages, aiMessage]);

        const scrollInterval = setInterval(() => {
          chatBottomRef.current?.scrollIntoView({ 
            behavior: 'smooth',
          });
        },  5 * aiMessage.content.length / 3 );
        setTimeout(() => {
          clearInterval(scrollInterval);
        }, 5 * aiMessage.content.length);
      });
    }
  }, [chatContext]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, []);

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: IMessage = {
      id: Date.now(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date().toISOString(),
      isAnimating: false
    };

    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    chatBottomRef.current?.scrollIntoView({ 
      behavior: 'smooth',
    });

    const currentInput = inputMessage;
    setInputMessage('');
    setIsLoading(true);
    const recentHistory = messages
    .filter(msg => msg.sender === 'user' || msg.sender === 'ai')
    .slice(-4) 
    .map(msg => ({
      role: msg.sender,
      message: msg.content
    }));
    try {
      const response = await sendChatMessage(
        currentInput, 
        chatContext || '',
        recentHistory
      );

      const aiMessage: IMessage = {
        id: Date.now(),
        content: response.answer,
        sender: 'ai',
        timestamp: new Date().toISOString(),
        isAnimating: true
      };

      setMessages(prevMessages => [...prevMessages, aiMessage]);

      chatBottomRef.current?.scrollIntoView({ 
        behavior: 'smooth',
      });

      const scrollInterval = setInterval(() => {
        chatBottomRef.current?.scrollIntoView({ 
          behavior: 'smooth',
        });
      },  5 * aiMessage.content.length / 5 );
      setTimeout(() => {
        clearInterval(scrollInterval);
      }, 5 * aiMessage.content.length);
      
      if (chatContext) {
        setChatContext(null);
      }
    } catch (error) {
      console.error('Message send error:', error);
      
      setInputMessage(currentInput);
      
      const errorMessage: IMessage = {
        id: Date.now(),
        content: "Sorry, I couldn't process your request. Please try again.",
        sender: 'ai',
        timestamp: new Date().toISOString(),
        isAnimating: false
      };

      setMessages(prevMessages => [...prevMessages, errorMessage]);
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
        <h2 className="text-lg font-semibold text-white">Ask Buffett</h2>
      </div>

      <div 
        ref={chatContainerRef}
        className="flex-grow overflow-y-auto p-4 space-y-4 no-scrollbar pb-16 pt-20 max-h-[90vh]"
      >
        {messages.length === 0 && (
          <div className="text-center text-neutral-500 mt-10">
            <p className="text-xl mb-2">Ask Buffett</p>
            <p className="text-sm">Ask about stocks, investments, or market trends</p>
          </div>
        )}
        
        {messages.map((message) => {          
          return (
            <ChatMessage key={message.id} message={message} />
          );
        })}
        <div className="pt-10" ref={chatBottomRef} />
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-neutral-950 p-4 border-t border-neutral-900 z-10 mb-8">
        <div className="flex items-end space-x-2">
          <textarea 
            ref={textareaRef}
            value={inputMessage}
            onChange={(e) => {
              setInputMessage(e.target.value);
              adjustTextareaHeight();
            }}
            onKeyDown={handleKeyPress}
            placeholder="Ask about stocks, investments, or market trends"
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
            type="button"
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
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
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