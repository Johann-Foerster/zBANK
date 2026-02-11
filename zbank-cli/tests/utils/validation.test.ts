import { describe, it, expect } from '@jest/globals';
import {
  isValidAccountNumber,
  isValidPin,
  isValidAmount,
  validateTransactionAmount,
  hashPin,
  comparePin,
  dollarsToCents,
  centsToDollars,
  formatCurrency,
  sanitizeNumericInput,
  padAccountNumber,
  padPinForCobol,
} from '../../src/utils/validation';

describe('Validation Utilities', () => {
  describe('isValidAccountNumber', () => {
    it('should accept valid 10-digit account number', () => {
      expect(isValidAccountNumber('1234567890')).toBe(true);
      expect(isValidAccountNumber('0000012345')).toBe(true);
    });

    it('should reject account number with wrong length', () => {
      expect(isValidAccountNumber('123')).toBe(false);
      expect(isValidAccountNumber('12345678901')).toBe(false);
    });

    it('should reject account number with non-digits', () => {
      expect(isValidAccountNumber('12345abcde')).toBe(false);
      expect(isValidAccountNumber('123-456-789')).toBe(false);
    });
  });

  describe('isValidPin', () => {
    it('should accept valid 4-digit PIN', () => {
      expect(isValidPin('1234')).toBe(true);
      expect(isValidPin('0000')).toBe(true);
    });

    it('should reject PIN with wrong length', () => {
      expect(isValidPin('123')).toBe(false);
      expect(isValidPin('12345')).toBe(false);
    });

    it('should reject PIN with non-digits', () => {
      expect(isValidPin('12ab')).toBe(false);
      expect(isValidPin('12-3')).toBe(false);
    });
  });

  describe('isValidAmount', () => {
    it('should accept positive integers', () => {
      expect(isValidAmount(100)).toBe(true);
      expect(isValidAmount(1)).toBe(true);
    });

    it('should reject zero', () => {
      expect(isValidAmount(0)).toBe(false);
    });

    it('should reject negative numbers', () => {
      expect(isValidAmount(-100)).toBe(false);
    });

    it('should reject non-integers', () => {
      expect(isValidAmount(100.5)).toBe(false);
    });
  });

  describe('validateTransactionAmount', () => {
    it('should accept valid positive integers', () => {
      expect(validateTransactionAmount(100)).toBe(true);
      expect(validateTransactionAmount(1)).toBe(true);
      expect(validateTransactionAmount(10000)).toBe(true);
    });

    it('should accept maximum allowed amount', () => {
      expect(validateTransactionAmount(1000000000)).toBe(true);
    });

    it('should reject zero', () => {
      expect(validateTransactionAmount(0)).toBe(false);
    });

    it('should reject negative numbers', () => {
      expect(validateTransactionAmount(-100)).toBe(false);
      expect(validateTransactionAmount(-1)).toBe(false);
    });

    it('should reject non-integers', () => {
      expect(validateTransactionAmount(100.5)).toBe(false);
      expect(validateTransactionAmount(0.1)).toBe(false);
    });

    it('should reject amounts exceeding maximum limit', () => {
      expect(validateTransactionAmount(1000000001)).toBe(false);
      expect(validateTransactionAmount(2000000000)).toBe(false);
    });

    it('should accept amount just below maximum', () => {
      expect(validateTransactionAmount(999999999)).toBe(true);
    });
  });

  describe('hashPin and comparePin', () => {
    it('should hash a valid PIN', async () => {
      const hashed = await hashPin('1234');
      expect(hashed).toBeDefined();
      expect(hashed).not.toBe('1234');
      expect(hashed.startsWith('$2b$')).toBe(true);
    });

    it('should throw error for invalid PIN format', async () => {
      await expect(hashPin('123')).rejects.toThrow('Invalid PIN format');
      await expect(hashPin('12345')).rejects.toThrow('Invalid PIN format');
    });

    it('should correctly compare PIN with hash', async () => {
      const pin = '1234';
      const hashed = await hashPin(pin);
      
      const isMatch = await comparePin(pin, hashed);
      expect(isMatch).toBe(true);
    });

    it('should reject incorrect PIN', async () => {
      const pin = '1234';
      const hashed = await hashPin(pin);
      
      const isMatch = await comparePin('5678', hashed);
      expect(isMatch).toBe(false);
    });

    it('should generate different hashes for same PIN', async () => {
      const pin = '1234';
      const hash1 = await hashPin(pin);
      const hash2 = await hashPin(pin);
      
      // Hashes should be different (bcrypt uses salt)
      expect(hash1).not.toBe(hash2);
      
      // But both should match the original PIN
      expect(await comparePin(pin, hash1)).toBe(true);
      expect(await comparePin(pin, hash2)).toBe(true);
    });
  });

  describe('dollarsToCents', () => {
    it('should convert dollars to cents', () => {
      expect(dollarsToCents(100)).toBe(10000);
      expect(dollarsToCents(1.50)).toBe(150);
      expect(dollarsToCents(0.01)).toBe(1);
    });

    it('should round to nearest cent', () => {
      expect(dollarsToCents(1.234)).toBe(123);
      expect(dollarsToCents(1.235)).toBe(124);
    });

    it('should handle negative values', () => {
      expect(dollarsToCents(-50)).toBe(-5000);
    });
  });

  describe('centsToDollars', () => {
    it('should convert cents to dollars', () => {
      expect(centsToDollars(10000)).toBe(100);
      expect(centsToDollars(150)).toBe(1.50);
      expect(centsToDollars(1)).toBe(0.01);
    });

    it('should handle negative values', () => {
      expect(centsToDollars(-5000)).toBe(-50);
    });
  });

  describe('formatCurrency', () => {
    it('should format cents as currency string', () => {
      expect(formatCurrency(10000)).toBe('$100.00');
      expect(formatCurrency(150)).toBe('$1.50');
      expect(formatCurrency(1)).toBe('$0.01');
    });

    it('should handle negative values', () => {
      expect(formatCurrency(-5000)).toBe('$-50.00');
    });

    it('should always show two decimal places', () => {
      expect(formatCurrency(100)).toBe('$1.00');
      expect(formatCurrency(0)).toBe('$0.00');
    });
  });

  describe('sanitizeNumericInput', () => {
    it('should remove non-numeric characters', () => {
      expect(sanitizeNumericInput('abc123def456')).toBe('123456');
      expect(sanitizeNumericInput('123-456-7890')).toBe('1234567890');
      expect(sanitizeNumericInput('$100.00')).toBe('10000');
    });

    it('should return empty string for no digits', () => {
      expect(sanitizeNumericInput('abcdef')).toBe('');
    });

    it('should preserve only digits', () => {
      expect(sanitizeNumericInput('1234567890')).toBe('1234567890');
    });
  });

  describe('padAccountNumber', () => {
    it('should pad account number to 10 digits', () => {
      expect(padAccountNumber('12345')).toBe('0000012345');
      expect(padAccountNumber('1')).toBe('0000000001');
    });

    it('should not change already 10-digit number', () => {
      expect(padAccountNumber('1234567890')).toBe('1234567890');
    });

    it('should not truncate longer numbers', () => {
      expect(padAccountNumber('12345678901')).toBe('12345678901');
    });
  });

  describe('padPinForCobol', () => {
    it('should pad PIN to 10 digits for COBOL compatibility', () => {
      expect(padPinForCobol('1111')).toBe('0000001111');
      expect(padPinForCobol('1234')).toBe('0000001234');
    });

    it('should not change already 10-digit PIN', () => {
      expect(padPinForCobol('0000001111')).toBe('0000001111');
    });
  });
});
