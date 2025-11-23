import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Trigger animation when route changes
    setIsAnimating(false);
    const timer = setTimeout(() => {
      setIsAnimating(true);
    }, 10);
    
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div
      key={location.pathname}
      className={`w-full min-h-full ${isAnimating ? 'page-transition-fade' : 'opacity-0'}`}
    >
      {children}
    </div>
  );
}

