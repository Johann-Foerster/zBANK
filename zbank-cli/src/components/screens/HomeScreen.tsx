/**
 * HomeScreen - Placeholder for home/transaction screen
 * 
 * Will be fully implemented in Task 07: Build Home/Transaction Screen
 * This placeholder shows the structure and navigation integration
 */

import React from 'react';
import { Box, Text } from 'ink';
import { Header } from '../common/Header.js';
import { Footer } from '../common/Footer.js';

interface HomeScreenProps {
  onLogout: () => void;
  onRegister?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onLogout: _onLogout, onRegister: _onRegister }) => {
  return (
    <Box flexDirection="column">
      <Header title="HOME SCREEN" />
      <Box flexDirection="column" padding={2}>
        <Text>🏠 Transaction Menu</Text>
        <Box marginTop={1}>
          <Text dimColor>Select a transaction type:</Text>
        </Box>
        <Box marginTop={1} flexDirection="column" gap={1}>
          <Text>• [D] Deposit funds</Text>
          <Text>• [W] Withdraw funds</Text>
          <Text>• [Q] Quit (Logout)</Text>
        </Box>
        <Box marginTop={2}>
          <Text color="yellow">⚠ Placeholder - Full implementation in Task 07</Text>
        </Box>
      </Box>
      <Footer hints={['[D] Deposit', '[W] Withdraw', '[Q] Quit']} />
    </Box>
  );
};
