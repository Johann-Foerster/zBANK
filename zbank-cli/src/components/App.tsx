/**
 * App - Main application container with navigation
 * 
 * Implements state machine pattern for screen navigation similar to COBOL application.
 * Renders appropriate screen based on current navigation state.
 */

import React from 'react';
import { Box, Text } from 'ink';
import { useNavigation } from '../contexts/NavigationContext.js';
import { AppState } from '../types/navigation.js';
import { SplashScreen } from './SplashScreen.js';
import { LoginScreen } from './screens/LoginScreen.js';
import { HomeScreen } from './screens/HomeScreen.js';
import { RegisterScreen } from './screens/RegisterScreen.js';
import { HelpScreen } from './screens/HelpScreen.js';
import { ExitScreen } from './screens/ExitScreen.js';

export const App: React.FC = () => {
  const { currentState, navigateTo } = useNavigation();

  const renderScreen = () => {
    switch (currentState) {
      case AppState.SPLASH:
        return (
          <SplashScreen
            onComplete={() => navigateTo(AppState.LOGIN)}
          />
        );

      case AppState.LOGIN:
        return (
          <LoginScreen
            onSuccess={() => navigateTo(AppState.HOME)}
            onRegister={() => navigateTo(AppState.REGISTER)}
            onHelp={() => navigateTo(AppState.HELP)}
          />
        );

      case AppState.HOME:
        return (
          <HomeScreen
            onLogout={() => navigateTo(AppState.EXIT)}
          />
        );

      case AppState.REGISTER:
        return (
          <RegisterScreen
            onBack={() => navigateTo(AppState.LOGIN)}
            onSuccess={() => navigateTo(AppState.LOGIN)}
          />
        );

      case AppState.HELP:
        return (
          <HelpScreen
            onBack={() => navigateTo(AppState.LOGIN)}
          />
        );

      case AppState.EXIT:
        return <ExitScreen />;

      default:
        return <Box><Text>Unknown state: {currentState}</Text></Box>;
    }
  };

  return (
    <Box flexDirection="column" padding={1}>
      {renderScreen()}
    </Box>
  );
};
