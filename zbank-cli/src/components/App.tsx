/**
 * App - Main application container with navigation
 * 
 * Implements state machine pattern for screen navigation similar to COBOL application.
 * Renders appropriate screen based on current navigation state.
 */

import React from 'react';
import { Box } from 'ink';
import { useNavigation } from '../contexts/NavigationContext.js';
import { AppState } from '../types/navigation.js';
import { LoginScreen } from './screens/LoginScreen.js';
import { HomeScreen } from './screens/HomeScreen.js';
import { RegisterScreen } from './screens/RegisterScreen.js';
import { ExitScreen } from './screens/ExitScreen.js';

export const App: React.FC = () => {
  const { currentState, navigateTo } = useNavigation();

  const renderScreen = () => {
    switch (currentState) {
      case AppState.LOGIN:
        return (
          <LoginScreen
            onSuccess={() => navigateTo(AppState.HOME)}
            onRegister={() => navigateTo(AppState.REGISTER)}
          />
        );

      case AppState.HOME:
        return (
          <HomeScreen
            onLogout={() => navigateTo(AppState.EXIT)}
            onRegister={() => navigateTo(AppState.REGISTER)}
          />
        );

      case AppState.REGISTER:
        return (
          <RegisterScreen
            onBack={() => navigateTo(AppState.LOGIN)}
            onSuccess={() => navigateTo(AppState.LOGIN)}
          />
        );

      case AppState.EXIT:
        return <ExitScreen />;

      default:
        return (
          <Box>
            <Box>Unknown state: {currentState}</Box>
          </Box>
        );
    }
  };

  return (
    <Box flexDirection="column" padding={1}>
      {renderScreen()}
    </Box>
  );
};
