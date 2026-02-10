/**
 * LoginScreen - Placeholder for login screen
 * 
 * Will be fully implemented in Task 06: Build Login Screen Component
 * This placeholder shows the structure and navigation integration
 */

import React from 'react';
import { Box, Text } from 'ink';
import { Header } from '../common/Header.js';
import { Footer } from '../common/Footer.js';

interface LoginScreenProps {
  onSuccess: () => void;
  onRegister?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onSuccess: _onSuccess, onRegister: _onRegister }) => {
  return (
    <Box flexDirection="column">
      <Header title="LOGIN SCREEN" />
      <Box flexDirection="column" padding={2}>
        <Text>📋 Account Login</Text>
        <Box marginTop={1}>
          <Text dimColor>Enter account number and PIN to access your account.</Text>
        </Box>
        <Box marginTop={2}>
          <Text color="yellow">⚠ Placeholder - Full implementation in Task 06</Text>
        </Box>
        <Box marginTop={2}>
          <Text dimColor>
            Temporary: Press Ctrl+C to exit
          </Text>
        </Box>
      </Box>
      <Footer hints={['[R] Register', '[Q] Quit']} />
    </Box>
  );
};
