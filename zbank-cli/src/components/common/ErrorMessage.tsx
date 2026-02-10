/**
 * ErrorMessage - Component for displaying error messages
 * 
 * Shows error messages in a consistent, user-friendly format
 */

import React from 'react';
import { Box, Text } from 'ink';

interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onDismiss }) => {
  return (
    <Box flexDirection="column" borderStyle="round" borderColor="red" padding={1} marginY={1}>
      <Box>
        <Text color="red" bold>⚠ Error</Text>
      </Box>
      <Box marginTop={1}>
        <Text color="red">{message}</Text>
      </Box>
      {onDismiss && (
        <Box marginTop={1}>
          <Text dimColor>Press ESC to dismiss</Text>
        </Box>
      )}
    </Box>
  );
};
