import React from 'react';
import type { ResourceType } from '../../api/types';
import { FileText, Video, FileCode, Presentation, FileCheck, CheckCircle2, AlertCircle } from 'lucide-react';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'default' | 'blue' | 'purple' | 'emerald' | 'amber' | 'rose' | 'neutral' | 'grounded' | 'ungrounded';
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
        computedIcon = computedIcon || <FileText className="w-3 h-3" />;
        label = label || 'PDF';
        break;
      case 'video':
        computedVariant = 'purple';
        computedIcon = computedIcon || <Video className="w-3 h-3" />;
        label = label || 'Video';
        break;
      case 'notes':
        computedVariant = 'blue';
        computedIcon = computedIcon || <FileCheck className="w-3 h-3" />;
        label = label || 'Notes';
        break;
      case 'lab':
        computedVariant = 'emerald';
        computedIcon = computedIcon || <FileCode className="w-3 h-3" />;
        label = label || 'Lab';
        break;
      case 'slides':
        computedVariant = 'amber';
        computedIcon = computedIcon || <Presentation className="w-3 h-3" />;
        label = label || 'Slides';
        break;
    }
  }

  const variantStyles = {
    default: 'bg-zinc-800/80 text-zinc-300 border-zinc-700/60',
    neutral: 'bg-zinc-900 text-zinc-400 border-zinc-800',
    blue: 'bg-blue-950/60 text-blue-300 border-blue-800/50',
    purple: 'bg-purple-950/60 text-purple-300 border-purple-800/50',
    emerald: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/50',
    amber: 'bg-amber-950/60 text-amber-300 border-amber-800/50',
    rose: 'bg-rose-950/60 text-rose-300 border-rose-800/50',
    grounded: 'bg-emerald-950/70 text-emerald-300 border-emerald-700/60 font-medium',
    ungrounded: 'bg-amber-950/70 text-amber-300 border-amber-700/60 font-medium',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  if (variant === 'grounded' && !computedIcon) {
    computedIcon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
  }
  if (variant === 'ungrounded' && !computedIcon) {
    computedIcon = <AlertCircle className="w-3.5 h-3.5 text-amber-400" />;
  }

  return (
    <span
      className={`inline-flex items-center rounded-md border font-medium transition-colors ${variantStyles[computedVariant]} ${sizeStyles[size]} ${className}`}
    >
      {computedIcon}
      {label}
    </span>
  );
};
