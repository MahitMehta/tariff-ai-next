import { useEffect, useRef, useState } from "react";
import type { IMessage } from "./Chatbot";


interface ChatMessageProps {
    message: IMessage
}

const AnimatedText = ({ text }: { text: string }) => {
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    const cleanText = (text || '')
      .toString()
      .replace(/\s*undefined\s*$/i, '')
      .trim();

    if (!cleanText) {
      setDisplayText('');
      return;
    }

    let isMounted = true;
    let currentIndex = 0;

    const animateText = () => {
      if (currentIndex < cleanText.length && isMounted) {
        setDisplayText(prev => {
          const nextChar = cleanText[currentIndex];
          return prev + (nextChar || '');
        });
        currentIndex++;
        setTimeout(animateText, 5);
      }
    };

    animateText();

    return () => {
      isMounted = false;
    };
  }, [text]);

  return <>{displayText}</>;
};

const ChatMessage : React.FC<ChatMessageProps> = ({ message }) => {
    return (
        <div 
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
                    : 'bg-neutral-900 text-neutral-200 text-left'
                }
            `}
            >
            {message.content === '...' ? (
                <span className="typing-dots inline-flex space-x-1">
                <span className="dot w-2 h-2 bg-neutral-400 rounded-full animate-bounce [animation-delay:0s]"/>
                <span className="dot w-2 h-2 bg-neutral-400 rounded-full animate-bounce [animation-delay:0.15s]"/>
                <span className="dot w-2 h-2 bg-neutral-400 rounded-full animate-bounce [animation-delay:0.3s]" />
                </span>
            ) : message.isAnimating ? (
                <AnimatedText text={message.content} />
            ) : (
                message.content
            )}
            </div>
        </div>
    )
}

export default ChatMessage;