
import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingProps {
  message?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Loading: React.FC<LoadingProps> = ({ 
  message = "Loading...", 
  className,
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  return (
    <div className={cn(
      "min-h-screen bg-gradient-to-br from-ivory via-white to-gold/10 flex items-center justify-center",
      className
    )}>
      <div className="text-center animate-fade-in">
        <div className={cn(
          "animate-spin rounded-full border-b-2 border-gold mx-auto mb-4",
          sizeClasses[size]
        )}></div>
        <p className="text-navy/60 font-inter">{message}</p>
      </div>
    </div>
  );
};

export default Loading;
