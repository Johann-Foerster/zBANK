/**
 * RegisterScreen - Skeleton registration screen
 * 
 * Matches the COBOL ZRGSTR map which has UI but no actual registration logic.
 * This is a skeleton/placeholder implementation showing the registration form
 * without implementing account creation functionality.
 */

import React, { useState } from 'react';
import { Box, Text } from 'ink';
import { Header } from '../common/Header.js';
import { Footer } from '../common/Footer.js';
import { NumericInput } from '../common/NumericInput.js';
import { useKeyboard } from '../../hooks/useKeyboard.js';

interface RegisterScreenProps {
  onBack: () => void;
  onSuccess?: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ onBack, onSuccess }) => {
  const [accountNumber, setAccountNumber] = useState('');
  const [pin, setPin] = useState('');
  
  // Props intentionally unused in this skeleton implementation
  void onSuccess;

  // Handle Q key to go back to login
  useKeyboard({
    Q: onBack,
    ESCAPE: onBack,
  });

  return (
    <Box flexDirection="column">
      <Header title="REGISTER" showLogo={true} />

      <Box flexDirection="column" paddingX={2} paddingTop={1}>
        {/* Account Number Input */}
        <Box flexDirection="column" marginBottom={1}>
          <Text color="cyan">Account Number (10 digits):</Text>
          <NumericInput
            value={accountNumber}
            onChange={setAccountNumber}
            maxLength={10}
            placeholder="0000000000"
            focus={true}
          />
        </Box>

        {/* PIN Input */}
        <Box flexDirection="column" marginBottom={1}>
          <Text color="cyan">PIN (4 digits):</Text>
          <NumericInput
            value={pin}
            onChange={setPin}
            maxLength={4}
            mask="*"
            placeholder="****"
            focus={false}
          />
        </Box>

        {/* Warning Message */}
        <Box marginTop={1} marginBottom={1}>
          <Text color="yellow">
            ⚠ Registration functionality not yet implemented (matching COBOL)
          </Text>
        </Box>

        {/* Instructions */}
        <Box marginTop={1}>
          <Text dimColor>
            This screen matches the COBOL ZRGSTR map skeleton.
          </Text>
        </Box>
      </Box>

      <Footer hints={['[Q] Back to Login', '[ESC] Back']} />
    </Box>
  );
};
