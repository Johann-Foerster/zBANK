/**
 * NumericInput - Validated numeric input component
 * 
 * Provides a text input that only accepts numeric characters
 * and enforces a maximum length constraint.
 */

import React from 'react';
import TextInput from 'ink-text-input';

interface NumericInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  maxLength: number;
  mask?: string;
  placeholder?: string;
  focus?: boolean;
}

export const NumericInput: React.FC<NumericInputProps> = ({
  value,
  onChange,
  onSubmit,
  maxLength,
  mask,
  placeholder,
  focus = true,
}) => {
  const handleChange = (input: string) => {
    // Only allow numeric input
    const numeric = input.replace(/\D/g, '');
    // Limit to maxLength
    const limited = numeric.slice(0, maxLength);
    onChange(limited);
  };

  return (
    <TextInput
      value={value}
      onChange={handleChange}
      onSubmit={onSubmit}
      mask={mask}
      placeholder={placeholder}
      focus={focus}
    />
  );
};
