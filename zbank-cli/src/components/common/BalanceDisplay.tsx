/**
 * BalanceDisplay - Component for displaying account balance
 * 
 * Shows formatted balance with color coding:
 * - Green for positive balances
 * - Red for negative balances (overdrafts)
 */

import React from 'react';
import { Box, Text } from 'ink';
import { formatBalance } from '../../utils/formatter.js';

interface BalanceDisplayProps {
  balance: number;
  label?: string;
}

export const BalanceDisplay: React.FC<BalanceDisplayProps> = ({ 
  balance,
  label = 'Current Balance'
}) => {
  const formatted = formatBalance(balance);
  const color = balance >= 0 ? 'green' : 'red';

  return (
    <Box flexDirection="column" paddingY={1}>
      <Text dimColor>{label}:</Text>
      <Text bold color={color}>
        {formatted}
      </Text>
    </Box>
  );
};
