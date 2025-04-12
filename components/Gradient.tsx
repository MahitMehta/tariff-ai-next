"use client";

import React, { useEffect, useState } from 'react';

interface GradientCircleProps {
  id: number;
  size: number;
  opacity: number;
  top: string;
  left: string;
  blur: string;
  rotate: number;
  gradient: string;
  animationName: string;
  animationDuration: number;
}

interface GradientBlurCirclesProps {
  count?: number;
  minSize?: number;
  maxSize?: number;
  minOpacity?: number;
  maxOpacity?: number;
  blurStrength?: number;
}

const GradientBlurCircles: React.FC<GradientBlurCirclesProps> = ({
  count = 3,
  minSize = 300,
  maxSize = 800,
  minOpacity = 0.15,
  maxOpacity = 0.3,
  blurStrength = 120
}) => {
  // State to hold circle configurations
  const [circles, setCircles] = useState<GradientCircleProps[]>([]);
  const [isClient, setIsClient] = useState(false);

  // Use useEffect to generate circles on the client side only
  useEffect(() => {
    setIsClient(true);
    
    // Emerald green color palette
    const emeraldColors = [
      '#059669', // emerald-600
      '#10b981', // emerald-500
      '#34d399', // emerald-400
      '#047857', // emerald-700
      '#065f46', // emerald-800
      '#064e3b', // emerald-900
    ];
    
    // Helper to get positions biased towards edges
    const biasedRandom = () => {
      const r = Math.random();
      return r < 0.5 ? r * 0.3 : 0.7 + r * 0.3;
    };
    
    // Generate circle configurations
    const newCircles = Array.from({ length: count }, (_, i) => {
      const size = Math.random() * (maxSize - minSize) + minSize;
      const opacity = Math.random() * (maxOpacity - minOpacity) + minOpacity;
      const primaryColor = emeraldColors[Math.floor(Math.random() * emeraldColors.length)];
      const secondaryColor = emeraldColors[Math.floor(Math.random() * emeraldColors.length)];
      
      // 70% chance to place at bottom half of screen
      const bottomBias = Math.random() < 0.7;
      const left = `${biasedRandom() * 100}vw`;
      const top = bottomBias ? 
        `${70 + Math.random() * 30}vh` : 
        `${biasedRandom() * 60}vh`;
      
      const blurAmount = `${Math.random() * blurStrength + 70}px`;
      
      // Animation parameters
      const animationDuration = 80 + Math.random() * 60; // 80-140s
      const animationName = `float-${Math.floor(Math.random() * 5) + 1}`;
      
      return {
        id: i,
        size,
        opacity,
        top,
        left,
        blur: blurAmount,
        rotate: Math.random() * 60 - 30,
        gradient: `radial-gradient(circle, ${primaryColor} 0%, ${secondaryColor} 100%)`,
        animationName,
        animationDuration,
      };
    });
    
    setCircles(newCircles);
  }, [count, minSize, maxSize, minOpacity, maxOpacity, blurStrength]);
  
  // Styles for the animation keyframes
  const keyframeStyles = `
    @keyframes float-1 {
      0%, 100% { transform: translate(-50%, -50%) rotate(var(--rotate)) translate(0, 0); }
      25% { transform: translate(-50%, -50%) rotate(var(--rotate)) translate(20px, 10px); }
      50% { transform: translate(-50%, -50%) rotate(var(--rotate)) translate(0px, 25px); }
      75% { transform: translate(-50%, -50%) rotate(var(--rotate)) translate(-15px, 5px); }
    }
    
    @keyframes float-2 {
      0%, 100% { transform: translate(-50%, -50%) rotate(var(--rotate)) translate(0, 0); }
      20% { transform: translate(-50%, -50%) rotate(var(--rotate)) translate(-20px, 10px); }
      40% { transform: translate(-50%, -50%) rotate(var(--rotate)) translate(-25px, -15px); }
      60% { transform: translate(-50%, -50%) rotate(var(--rotate)) translate(0px, -25px); }
      80% { transform: translate(-50%, -50%) rotate(var(--rotate)) translate(15px, -10px); }
    }
    
    @keyframes float-3 {
      0%, 100% { transform: translate(-50%, -50%) rotate(var(--rotate)) translate(0, 0); }
      33% { transform: translate(-50%, -50%) rotate(var(--rotate)) translate(15px, 15px); }
      66% { transform: translate(-50%, -50%) rotate(var(--rotate)) translate(-15px, 15px); }
    }
    
    @keyframes float-4 {
      0%, 100% { transform: translate(-50%, -50%) rotate(var(--rotate)) translate(0, 0); }
      25% { transform: translate(-50%, -50%) rotate(var(--rotate)) translate(10px, -10px); }
      50% { transform: translate(-50%, -50%) rotate(var(--rotate)) translate(25px, 0px); }
      75% { transform: translate(-50%, -50%) rotate(var(--rotate)) translate(10px, 10px); }
    }
    
    @keyframes float-5 {
      0%, 100% { transform: translate(-50%, -50%) rotate(var(--rotate)) translate(0, 0); }
      20% { transform: translate(-50%, -50%) rotate(var(--rotate)) translate(5px, 10px); }
      40% { transform: translate(-50%, -50%) rotate(var(--rotate)) translate(15px, 15px); }
      60% { transform: translate(-50%, -50%) rotate(var(--rotate)) translate(20px, 5px); }
      80% { transform: translate(-50%, -50%) rotate(var(--rotate)) translate(10px, -5px); }
    }
    
    .gradient-circle {
      position: absolute;
      border-radius: 9999px;
      mix-blend-mode: screen;
      animation-iteration-count: infinite;
      animation-timing-function: ease-in-out;
      will-change: transform;
    }
  `;
  
  // Don't render anything during SSR to avoid hydration mismatch
  if (!isClient) {
    return <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 bg-black"></div>;
  }
  
  return (
    <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 bg-black">
      <style jsx>{keyframeStyles}</style>
      
      {circles.map((circle) => (
        <div
          key={circle.id}
          className="gradient-circle"
          style={{
            '--rotate': `${circle.rotate}deg`,
            '--duration': `${circle.animationDuration}s`,
            width: circle.size + 'px',
            height: circle.size + 'px',
            opacity: circle.opacity,
            top: circle.top,
            left: circle.left,
            transform: `translate(-50%, -50%) rotate(${circle.rotate}deg)`,
            filter: `blur(${circle.blur})`,
            background: circle.gradient,
            animationName: circle.animationName,
            animationDuration: `${circle.animationDuration}s`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};

export default GradientBlurCircles;