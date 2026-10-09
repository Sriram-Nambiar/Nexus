import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  label = 'Loading...',
  size = 'md',
  className = '',
}) => {
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className={`flex flex-col items-center justify-center py-10 px-4 text-center ${className}`}>
      <Loader2 className={`${iconSizes[size]} text-zinc-400 animate-spin mb-3`} />
      {label && <p className="text-sm text-zinc-400 font-medium">{label}</p>}
    </div>
  );
};
