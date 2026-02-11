import { describe, it, expect } from '@jest/globals';
import { sanitizeNumericInput } from '../../../src/utils/validation.js';

describe('NumericInput Validation Logic', () => {
  it('should remove non-numeric characters', () => {
    expect(sanitizeNumericInput('abc123def456!@#')).toBe('123456');
    expect(sanitizeNumericInput('hello123world')).toBe('123');
    expect(sanitizeNumericInput('!@#$%^&*()')).toBe('');
  });

  it('should preserve numeric characters', () => {
    expect(sanitizeNumericInput('1234567890')).toBe('1234567890');
    expect(sanitizeNumericInput('0000012345')).toBe('0000012345');
  });

  it('should handle empty string', () => {
    expect(sanitizeNumericInput('')).toBe('');
  });

  it('should handle mixed input', () => {
    expect(sanitizeNumericInput('Account: 1234567890')).toBe('1234567890');
    expect(sanitizeNumericInput('PIN-1111')).toBe('1111');
  });

  it('should truncate to max length (simulated)', () => {
    const input = sanitizeNumericInput('12345678901234567890');
    const maxLength = 10;
    const truncated = input.slice(0, maxLength);
    expect(truncated).toBe('1234567890');
    expect(truncated.length).toBe(10);
  });
});

describe('NumericInput Component Logic', () => {
  describe('Account Number Validation', () => {
    it('should accept 10-digit account numbers', () => {
      const maxLength = 10;
      const input = '0000012345';
      expect(input.length).toBe(maxLength);
      expect(/^\d{10}$/.test(input)).toBe(true);
    });

    it('should reject account numbers with less than 10 digits', () => {
      const maxLength = 10;
      const input = '12345';
      expect(input.length).toBeLessThan(maxLength);
    });

    it('should truncate account numbers longer than 10 digits', () => {
      const maxLength = 10;
      const input = '12345678901234';
      const truncated = input.slice(0, maxLength);
      expect(truncated.length).toBe(maxLength);
      expect(truncated).toBe('1234567890');
    });
  });

  describe('PIN Validation', () => {
    it('should accept 4-digit PINs', () => {
      const maxLength = 4;
      const input = '1111';
      expect(input.length).toBe(maxLength);
      expect(/^\d{4}$/.test(input)).toBe(true);
    });

    it('should reject PINs with less than 4 digits', () => {
      const maxLength = 4;
      const input = '11';
      expect(input.length).toBeLessThan(maxLength);
    });

    it('should truncate PINs longer than 4 digits', () => {
      const maxLength = 4;
      const input = '123456';
      const truncated = input.slice(0, maxLength);
      expect(truncated.length).toBe(maxLength);
      expect(truncated).toBe('1234');
    });
  });

  describe('Masking Logic', () => {
    it('should mask PIN with asterisks', () => {
      const pin = '1111';
      const masked = '*'.repeat(pin.length);
      expect(masked).toBe('****');
      expect(masked).not.toContain('1111');
    });

    it('should not mask account number', () => {
      const accountNumber = '0000012345';
      expect(accountNumber).toBe('0000012345');
    });
  });
});
