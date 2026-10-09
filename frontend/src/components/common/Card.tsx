import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverable?: boolean;
  variant?: 'white' | 'yellow' | 'sage' | 'charcoal';
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverable = false,
  variant = 'white',
  className = '',
  ...props
}) => {
  const variantStyles = {
    white: 'bg-white text-black',
    yellow: 'bg-[#ffe17c] text-black',
    sage: 'bg-[#b7c6c2] text-black',
    charcoal: 'bg-[#171e19] text-white',
  };

  return (
    <div
      className={`border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_#000000] overflow-hidden ${
        variantStyles[variant]
      } ${
        hoverable
          ? 'hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#000000] transition-all duration-150'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
