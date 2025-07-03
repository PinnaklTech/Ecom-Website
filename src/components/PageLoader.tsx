
import React, { useState, useEffect } from 'react';
import Loading from './Loading';

interface PageLoaderProps {
  children: React.ReactNode;
  loadingMessage?: string;
  minLoadingTime?: number;
}

const PageLoader: React.FC<PageLoaderProps> = ({ 
  children, 
  loadingMessage = "Loading page...",
  minLoadingTime = 500 
}) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, minLoadingTime);

    return () => clearTimeout(timer);
  }, [minLoadingTime]);

  if (isLoading) {
    return <Loading message={loadingMessage} />;
  }

  return <div className="animate-fade-in">{children}</div>;
};

export default PageLoader;
