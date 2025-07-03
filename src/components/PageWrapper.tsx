
import React, { useState, useEffect } from 'react';
import Loading from './Loading';

interface PageWrapperProps {
  children: React.ReactNode;
  loadingMessage?: string;
  loadingDuration?: number;
  className?: string;
}

const PageWrapper: React.FC<PageWrapperProps> = ({ 
  children, 
  loadingMessage = "Loading...",
  loadingDuration = 500,
  className = ""
}) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, loadingDuration);

    return () => clearTimeout(timer);
  }, [loadingDuration]);

  if (isLoading) {
    return <Loading message={loadingMessage} />;
  }

  return (
    <div className={`animate-fade-in ${className}`}>
      {children}
    </div>
  );
};

export default PageWrapper;
