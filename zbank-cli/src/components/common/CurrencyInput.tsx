/**
 * CurrencyInput - Validated currency input component
 * 
 * Provides a text input that only accepts currency values
 * with proper decimal formatting (XX.XX).
 */

import React from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';

interface CurrencyInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  focus?: boolean;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = '0.00',
  focus = true,
}) => {
  const handleChange = (input: string) => {
    // Allow digits and single decimal point
    // Regex: optional digits, optional decimal point, up to 2 decimal places
    const valid = /^\d*\.?\d{0,2}$/.test(input);
    if (valid || input === '') {
      onChange(input);
    }
  };

  return (
    <Box>
      <Text color="green">$ </Text>
      <TextInput
        value={value}
        onChange={handleChange}
        onSubmit={onSubmit}
        placeholder={placeholder}
        focus={focus}
      />
    </Box>
  );
};
