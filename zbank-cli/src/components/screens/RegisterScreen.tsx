/**
 * RegisterScreen - Placeholder for registration screen
 * 
 * Will be fully implemented in Task 08: Build Registration Screen
 * This placeholder shows the structure and navigation integration
 */

import React from 'react';
import { Box, Text } from 'ink';
import { Header } from '../common/Header.js';
import { Footer } from '../common/Footer.js';

interface RegisterScreenProps {
  onBack: () => void;
  onSuccess?: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ onBack, onSuccess }) => {
  // Placeholder component - will be fully implemented in Task 08
  // Props are intentionally unused in this placeholder
  void onBack;
  void onSuccess;
  return (
    <Box flexDirection="column">
      <Header title="REGISTRATION SCREEN" />
      <Box flexDirection="column" padding={2}>
        <Text>📝 New Account Registration</Text>
        <Box marginTop={1}>
          <Text dimColor>Create a new zBANK account.</Text>
        </Box>
        <Box marginTop={2}>
          <Text color="yellow">⚠ Placeholder - Full implementation in Task 08</Text>
        </Box>
        <Box marginTop={2}>
          <Text dimColor>
            Press ESC or Q to go back to login
          </Text>
        </Box>
      </Box>
      <Footer hints={['[ESC] Back to Login', '[Q] Quit']} />
    </Box>
  );
};
