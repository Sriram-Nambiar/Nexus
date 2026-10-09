import React from 'react';
import type { ResourceType } from '../../api/types';
import { FileText, Video, FileCode, Presentation, FileCheck, CheckCircle2, AlertCircle } from 'lucide-react';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'default' | 'blue' | 'purple' | 'emerald' | 'amber' | 'rose' | 'neutral' | 'yellow' | 'sage' | 'grounded' | 'ungrounded';
  size?: 'sm' | 'md';
  resourceType?: ResourceType;
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  resourceType,
  icon,
  className = '',
}) => {
  let computedVariant = variant;
  let computedIcon = icon;
  let label = children;

  if (resourceType) {
    switch (resourceType) {
      case 'pdf':
        computedVariant = 'rose';
        computedIcon = computedIcon || <FileText className="w-3 h-3 text-black" />;
        label = label || 'PDF';
        break;
      case 'video':
        computedVariant = 'yellow';
        computedIcon = computedIcon || <Video className="w-3 h-3 text-black" />;
        label = label || 'Video';
        break;
      case 'notes':
        computedVariant = 'sage';
        computedIcon = computedIcon || <FileCheck className="w-3 h-3 text-black" />;
        label = label || 'Notes';
        break;
      case 'lab':
        computedVariant = 'emerald';
        computedIcon = computedIcon || <FileCode className="w-3 h-3 text-black" />;
        label = label || 'Lab';
        break;
      case 'slides':
        computedVariant = 'amber';
        computedIcon = computedIcon || <Presentation className="w-3 h-3 text-black" />;
        label = label || 'Slides';
        break;
    }
  }

  const variantStyles = {
    default: 'bg-[#f4f4f5] text-black',
    neutral: 'bg-white text-black',
    yellow: 'bg-[#ffe17c] text-black',
    sage: 'bg-[#b7c6c2] text-black',
    blue: 'bg-[#bfdbfe] text-black',
    purple: 'bg-[#e9d5ff] text-black',
    emerald: 'bg-[#a7f3d0] text-black',
    amber: 'bg-[#fde68a] text-black',
    rose: 'bg-[#fecdd3] text-black',
    grounded: 'bg-[#b7c6c2] text-black',
    ungrounded: 'bg-[#ffe17c] text-black',
  };

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  if (variant === 'grounded' && !computedIcon) {
    computedIcon = <CheckCircle2 className="w-3.5 h-3.5 text-black" />;
  }
  if (variant === 'ungrounded' && !computedIcon) {
    computedIcon = <AlertCircle className="w-3.5 h-3.5 text-black" />;
  }

  return (
    <span
      className={`inline-flex items-center rounded-lg border-2 border-black font-bold uppercase tracking-wider shadow-[2px_2px_0px_0px_#000000] select-none ${variantStyles[computedVariant]} ${sizeStyles[size]} ${className}`}
    >
      {computedIcon}
      {label}
    </span>
  );
};
