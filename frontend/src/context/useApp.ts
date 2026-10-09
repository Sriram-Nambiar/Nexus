import { useContext } from 'react';
import { AppContext } from './contextDefinition';
import type { AppContextType } from './contextDefinition';

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export type { AppContextType };
