/**
 * ServiceContext - React context for dependency injection of services
 * 
 * Provides access to all application services (AuthService, TransactionService, etc.)
 * to components throughout the component tree.
 */

import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { AuthService } from '../services/AuthService.js';
import { SessionManager } from '../services/SessionManager.js';
import { TransactionService } from '../services/TransactionService.js';
import { JsonStorage } from '../services/JsonStorage.js';
import { IStorage } from '../services/IStorage.js';

interface Services {
  authService: AuthService;
  transactionService: TransactionService;
  sessionManager: SessionManager;
  storage: IStorage;
}

const ServiceContext = createContext<Services | null>(null);

interface ServiceProviderProps {
  children: ReactNode;
  storage?: IStorage;
  dataPath?: string;
}

/**
 * ServiceProvider - Wraps application with service context
 * 
 * Creates and provides all services to child components.
 * Services are created once and reused throughout the application.
 */
export const ServiceProvider: React.FC<ServiceProviderProps> = ({ 
  children, 
  storage: providedStorage,
  dataPath = './data'
}) => {
  const services = useMemo(() => {
    // Use provided storage or create default JsonStorage
    const storage = providedStorage || new JsonStorage(dataPath);
    
    // Initialize storage if it's a JsonStorage instance
    if (storage instanceof JsonStorage) {
      storage.initialize().catch((error: Error) => {
        console.error('Failed to initialize storage:', error);
      });
    }
    
    const sessionManager = new SessionManager();
    const authService = new AuthService(storage, sessionManager);
    const transactionService = new TransactionService(storage);

    return {
      authService,
      transactionService,
      sessionManager,
      storage,
    };
  }, [providedStorage, dataPath]);

  return (
    <ServiceContext.Provider value={services}>
      {children}
    </ServiceContext.Provider>
  );
};

/**
 * useServices - Hook to access service context
 * 
 * Throws error if used outside ServiceProvider
 */
export const useServices = (): Services => {
  const context = useContext(ServiceContext);
  if (!context) {
    throw new Error('useServices must be used within ServiceProvider');
  }
  return context;
};

/**
 * useAuth - Convenience hook to access AuthService
 */
export const useAuth = (): AuthService => {
  const { authService } = useServices();
  return authService;
};

/**
 * useTransactions - Convenience hook to access TransactionService
 */
export const useTransactions = (): TransactionService => {
  const { transactionService } = useServices();
  return transactionService;
};

/**
 * useSession - Convenience hook to access SessionManager
 */
export const useSession = (): SessionManager => {
  const { sessionManager } = useServices();
  return sessionManager;
};
