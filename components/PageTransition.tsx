"use client";

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

interface PageTransitionProps {
  children: React.ReactNode;
  transitionType?: 'fade' | 'slide' | 'zoom';
  duration?: number;
}

const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  transitionType = 'fade',
  duration = 400,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [transitioning, setTransitioning] = useState(false);
  
  // Track the current route for transitions
  const [currentPathname, setCurrentPathname] = useState(pathname);
  
  // Update the displayed children when not transitioning
  useEffect(() => {
    if (pathname !== currentPathname && !transitioning) {
      // Start transition when route changes
      setTransitioning(true);
      
      // After the exit animation completes, update the children
      const timer = setTimeout(() => {
        setDisplayChildren(children);
        setCurrentPathname(pathname);
        
        // Small delay before starting the enter animation
        const enterTimer = setTimeout(() => {
          setTransitioning(false);
        }, 50);
        
        return () => clearTimeout(enterTimer);
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [children, pathname, currentPathname, transitioning, duration]);
  
  // Get the appropriate transition classes based on the type
  const getTransitionClasses = () => {
    const baseClasses = 'transition-all w-full h-full';
    const durationClass = `duration-${duration}`;
    
    if (transitioning) {
      // Exit animations
      switch (transitionType) {
        case 'fade':
          return `${baseClasses} ${durationClass} opacity-0`;
        case 'slide':
          return `${baseClasses} ${durationClass} transform -translate-x-full`;
        case 'zoom':
          return `${baseClasses} ${durationClass} transform scale-95 opacity-0`;
        default:
          return `${baseClasses} ${durationClass} opacity-0`;
      }
    }
      // Normal/enter animations
      switch (transitionType) {
        case 'fade':
          return `${baseClasses} ${durationClass} opacity-100`;
        case 'slide':
          return `${baseClasses} ${durationClass} transform translate-x-0`;
        case 'zoom':
          return `${baseClasses} ${durationClass} transform scale-100 opacity-100`;
        default:
          return `${baseClasses} ${durationClass} opacity-100`;
      }
  };
  
  return (
    <div className={getTransitionClasses()}>
      {displayChildren}
    </div>
  );
};

export default PageTransition;