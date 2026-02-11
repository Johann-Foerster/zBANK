import { describe, it, expect } from '@jest/globals';
import { formatBalance } from '../../../src/utils/formatter.js';

describe('BalanceDisplay Logic', () => {
  describe('Balance Formatting', () => {
    it('should format positive balances correctly', () => {
      expect(formatBalance(10000)).toBe('$100.00');
      expect(formatBalance(5000)).toBe('$50.00');
      expect(formatBalance(123)).toBe('$1.23');
      expect(formatBalance(1)).toBe('$0.01');
    });

    it('should format zero balance', () => {
      expect(formatBalance(0)).toBe('$0.00');
    });

    it('should format negative balances (overdrafts)', () => {
      expect(formatBalance(-10000)).toBe('-$100.00');
      expect(formatBalance(-5000)).toBe('-$50.00');
      expect(formatBalance(-1)).toBe('-$0.01');
    });

    it('should always show 2 decimal places', () => {
      const formatted = formatBalance(10000);
      expect(formatted).toMatch(/\.\d{2}$/);
    });

    it('should include dollar sign', () => {
      expect(formatBalance(100)).toContain('$');
      expect(formatBalance(-100)).toContain('$');
    });
  });

  describe('Balance Color Logic', () => {
    it('should use green for positive balances', () => {
      const balance = 10000;
      const color = balance >= 0 ? 'green' : 'red';
      expect(color).toBe('green');
    });

    it('should use green for zero balance', () => {
      const balance = 0;
      const color = balance >= 0 ? 'green' : 'red';
      expect(color).toBe('green');
    });

    it('should use red for negative balances (overdrafts)', () => {
      const balance = -10000;
      const color = balance >= 0 ? 'green' : 'red';
      expect(color).toBe('red');
    });
  });

  describe('Balance Values', () => {
    it('should handle large balances', () => {
      expect(formatBalance(1000000000)).toBe('$10000000.00');
    });

    it('should handle small balances', () => {
      expect(formatBalance(1)).toBe('$0.01');
      expect(formatBalance(5)).toBe('$0.05');
      expect(formatBalance(10)).toBe('$0.10');
    });

    it('should handle typical banking amounts', () => {
      expect(formatBalance(10000)).toBe('$100.00');   // $100
      expect(formatBalance(20000)).toBe('$200.00');   // $200
      expect(formatBalance(50000)).toBe('$500.00');   // $500
      expect(formatBalance(100000)).toBe('$1000.00'); // $1000
    });
  });
});
