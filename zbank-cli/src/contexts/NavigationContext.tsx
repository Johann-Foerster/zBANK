/**
 * NavigationContext - React context provider for navigation state
 * 
 * Provides navigation state and methods to all components in the tree.
 * Uses React hooks for state management.
 */

import React, { createContext, useState, useContext, ReactNode } from 'react';
import { AppState, NavigationContext as INavigationContext } from '../types/navigation.js';

const NavigationContext = createContext<INavigationContext | null>(null);

interface NavigationProviderProps {
  children: ReactNode;
  initialState?: AppState;
}

/**
 * NavigationProvider - Wraps application with navigation context
 */
export const NavigationProvider: React.FC<NavigationProviderProps> = ({ 
  children, 
  initialState = AppState.LOGIN 
}) => {
  const [currentState, setCurrentState] = useState<AppState>(initialState);
  const [history, setHistory] = useState<AppState[]>([]);

  const navigateTo = (state: AppState) => {
    setHistory(prevHistory => [...prevHistory, currentState]);
    setCurrentState(state);
  };

  const goBack = () => {
    setHistory(prevHistory => {
      if (prevHistory.length === 0) {
        return prevHistory;
      }
      const previous = prevHistory[prevHistory.length - 1];
      setCurrentState(previous);
      return prevHistory.slice(0, -1);
    });
  };

  const previousState = history.length > 0 ? history[history.length - 1] : null;

  const value: INavigationContext = {
    currentState,
    previousState,
    navigateTo,
    goBack,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

/**
 * useNavigation - Hook to access navigation context
 * Throws error if used outside NavigationProvider
 */
export const useNavigation = (): INavigationContext => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
};
