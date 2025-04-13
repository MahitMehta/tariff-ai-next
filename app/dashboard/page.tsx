'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Chatbot from './components/chatbot';
import Post from './components/post';
import PostModal from './components/postModal';

const postsData = [
    {
      id: 1,
      username: 'Elon Musk',
      handle: '@elonmusk',
      verified: true,
      content: 'Congrats to the Giga Texas team on producing their 400,000th vehicle!',
      timestamp: '2025-04-12T14:00:00Z',
      positiveTickers: ['TSLA'],
      negativeTickers: [],
      report: "Tesla's Giga Texas milestone represents a significant production ramp-up, indicating strong manufacturing capabilities and potential for increased market share. The 400,000th vehicle production suggests improved operational efficiency and growing demand for electric vehicles.",
      stocks: [
        {
          ticker: 'TSLA',
          primaryRating: 'Buy',
          strongBuyPercent: 45,
          buyPercent: 25,
          holdPercent: 20,
          sellPercent: 7,
          strongSellPercent: 3,
          rationale: "Tesla's production milestone at Giga Texas demonstrates strong manufacturing capabilities, operational efficiency, and growing demand for electric vehicles. The company continues to lead in EV innovation and market expansion."
        }
      ]
    },
    {
      id: 2,
      username: 'CryptoAnalyst',
      handle: '@bitcoininsights',
      verified: true,
      content: 'Bitcoin approaching key resistance level. Analysts predict potential breakout in the next 48 hours. Stay tuned!',
      timestamp: '2025-04-12T14:00:00Z',
      positiveTickers: ['BTC'],
      negativeTickers: ['COIN'],
      report: "Bitcoin is nearing a critical resistance level, and analysts predict a potential breakout within the next 48 hours. If the cryptocurrency successfully breaches this level, it could spark increased trading activity, boost investor confidence, and potentially trigger an altcoin rally. However, failure to break through may lead to short-term bearish sentiment.",
      stocks: [
        {
          ticker: 'BTC',
          primaryRating: 'Neutral',
          strongBuyPercent: 50,
          buyPercent: 10,
          holdPercent: 35,
          sellPercent: 10,
          strongSellPercent: 5,
          rationale: "Bitcoin is at a critical juncture, approaching a key resistance level. A successful breakout could trigger increased trading activity and investor confidence, while failure may lead to short-term bearish sentiment."
        },
        {
          ticker: 'COIN',
          primaryRating: 'Hold',
          strongBuyPercent: 15,
          buyPercent: 25,
          holdPercent: 40,
          sellPercent: 15,
          strongSellPercent: 5,
          rationale: "Coinbase faces market volatility and regulatory challenges. The stock's performance is closely tied to cryptocurrency market dynamics and overall digital asset adoption."
        }
      ]
    },
    {
      id: 3,
      username: 'MarketWatch',
      handle: '@marketwatch',
      verified: true,
      content: 'Apple’s latest product launch focuses on AI-driven personal assistants, signaling a deeper push into AI and smart home technology.',
      timestamp: '2025-04-12T14:00:00Z',
      positiveTickers: ['AAPL'],
      negativeTickers: [],
      report: "Apple's new product launch highlights its focus on AI and smart home technology, a move that aligns with current market trends. The integration of AI-driven personal assistants could strengthen Apple's ecosystem, attracting more customers and enhancing user experience.",
      stocks: [
        {
          ticker: 'AAPL',
          primaryRating: 'Strong Buy',
          strongBuyPercent: 50,
          buyPercent: 30,
          holdPercent: 15,
          sellPercent: 3,
          strongSellPercent: 2,
          rationale: "Apple's continued innovation in AI and smart home technology positions the company for growth, leveraging its strong brand and ecosystem to capture market share in emerging tech industries."
        }
      ]
    }
];  

export default function DashboardPage() {
  const [selectedPost, setSelectedPost] = useState(null);
  const [leftPanelWidth, setLeftPanelWidth] = useState(50);
  
  // Use refs for performance-critical state
  const isDraggingRef = useRef(false);
  const containerRef = useRef(null);
  const rafRef = useRef(null);

  // @ts-ignore
  const handlePostClick = (post) => {
    setSelectedPost(post);
  };

  const handleCloseModal = () => {
    setSelectedPost(null);
  };

  const handleMouseDown = (e) => {
    isDraggingRef.current = true;
    e.preventDefault();
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      if (!isDraggingRef.current) return;
      
      const container = containerRef.current;
      if (!container) return;

      const containerWidth = container.offsetWidth;
      const mouseX = e.clientX - container.getBoundingClientRect().left;
      const newWidth = (mouseX / containerWidth) * 100;
      
      const constrainedWidth = Math.max(10, Math.min(90, newWidth));
      setLeftPanelWidth(constrainedWidth);
    });
  }, []);

  const handleMouseUp = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    isDraggingRef.current = false;
    
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="bg-black text-gray-300 w-full h-screen flex relative"
    >
      <div 
        className="bg-black transition-none duration-0 overflow-auto" 
        style={{ width: `${leftPanelWidth}%` }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="sticky top-0 bg-black/80 backdrop-blur-md z-10 border-b border-neutral-800 p-4">
            <h1 className="text-xl font-bold text-white">Activity</h1>
          </div>

        <div className="divide-y divide-neutral-800">
          {postsData.map((post) => (
            <div 
              key={post.id}  
              className="p-4 hover:bg-neutral-900/50 transition-colors duration-200 cursor-pointer"
              onClick={() => handlePostClick(post)}
            >    
                <Post {...post} />
              </div>
            ))}
          </div>

          <PostModal 
            isOpen={!!selectedPost} 
            onClose={handleCloseModal} 
            post={selectedPost} 
          />
        </div>
      </div>

      <div 
        className="bg-neutral-900/50 cursor-col-resize hover:bg-emerald-900/50 transition-colors"
        style={{ width: '5px' }}
        onMouseDown={handleMouseDown}
      />

      <div 
        className="bg-neutral-950 transition-none duration-0 overflow-hidden" 
        style={{ width: `${100 - leftPanelWidth}%` }}
      >
        <div className="text-neutral-400 text-center h-fit">
          <Chatbot />
        </div>
      </div>
    </div>
  );
}