import { describe, it, expect } from '@jest/globals';
import {
  formatTransaction,
  formatBalance,
  formatTimestamp,
  parseCurrency,
  formatAccountNumber,
} from '../../src/utils/formatter.js';
import { Transaction, TransactionType, TransactionStatus } from '../../src/models/Transaction.js';

describe('Formatter Utilities', () => {
  describe('formatBalance', () => {
    it('should format positive balance correctly', () => {
      expect(formatBalance(10000)).toBe('$100.00');
      expect(formatBalance(12345)).toBe('$123.45');
      expect(formatBalance(1)).toBe('$0.01');
    });

    it('should format negative balance correctly', () => {
      expect(formatBalance(-10000)).toBe('-$100.00');
      expect(formatBalance(-12345)).toBe('-$123.45');
      expect(formatBalance(-1)).toBe('-$0.01');
    });

    it('should format zero correctly', () => {
      expect(formatBalance(0)).toBe('$0.00');
    });

    it('should always show two decimal places', () => {
      expect(formatBalance(10000)).toBe('$100.00');
      expect(formatBalance(10050)).toBe('$100.50');
      expect(formatBalance(10005)).toBe('$100.05');
    });

    it('should handle large amounts', () => {
      expect(formatBalance(1000000000)).toBe('$10000000.00'); // $10 million
      expect(formatBalance(999999999)).toBe('$9999999.99');
    });
  });

  describe('formatTimestamp', () => {
    it('should format timestamp in correct format', () => {
      const date = new Date('2024-01-15T14:30:45.000Z');
      const formatted = formatTimestamp(date);

      // Should be in format YYYY-MM-DD HH:MM:SS
      expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
    });

    it('should pad single digit values with zeros', () => {
      const date = new Date('2024-01-05T09:05:03.000Z');
      const formatted = formatTimestamp(date);

      expect(formatted).toContain('-01-');
      expect(formatted).toContain('-05 ');
      expect(formatted).toContain(':05:');
      expect(formatted).toContain(':03');
    });

    it('should handle different dates correctly', () => {
      const date1 = new Date('2024-12-31T23:59:59.000Z');
      const formatted1 = formatTimestamp(date1);
      expect(formatted1).toContain('2024-12-31');
      expect(formatted1).toContain('23:59:59');

      const date2 = new Date('2024-01-01T00:00:00.000Z');
      const formatted2 = formatTimestamp(date2);
      expect(formatted2).toContain('2024-01-01');
      expect(formatted2).toContain('00:00:00');
    });
  });

  describe('formatTransaction', () => {
    it('should format deposit transaction', () => {
      const transaction: Transaction = {
        id: 'txn-123',
        accountNumber: '0000012345',
        type: TransactionType.DEPOSIT,
        amount: 5000,
        balanceBefore: 10000,
        balanceAfter: 15000,
        timestamp: new Date('2024-01-15T14:30:45.000Z'),
        status: TransactionStatus.COMPLETED,
      };

      const formatted = formatTransaction(transaction);

      expect(formatted).toContain('DEPOSIT');
      expect(formatted).toContain('$50.00');
      expect(formatted).toContain('$150.00');
      expect(formatted).toContain('2024-01-15');
    });

    it('should format withdrawal transaction', () => {
      const transaction: Transaction = {
        id: 'txn-456',
        accountNumber: '0000012345',
        type: TransactionType.WITHDRAWAL,
        amount: 3000,
        balanceBefore: 10000,
        balanceAfter: 7000,
        timestamp: new Date('2024-01-15T14:30:45.000Z'),
        status: TransactionStatus.COMPLETED,
      };

      const formatted = formatTransaction(transaction);

      expect(formatted).toContain('WITHDRAWAL');
      expect(formatted).toContain('$30.00');
      expect(formatted).toContain('$70.00');
    });

    it('should handle negative balances', () => {
      const transaction: Transaction = {
        id: 'txn-789',
        accountNumber: '0000012345',
        type: TransactionType.WITHDRAWAL,
        amount: 15000,
        balanceBefore: 10000,
        balanceAfter: -5000,
        timestamp: new Date('2024-01-15T14:30:45.000Z'),
        status: TransactionStatus.COMPLETED,
      };

      const formatted = formatTransaction(transaction);

      expect(formatted).toContain('WITHDRAWAL');
      expect(formatted).toContain('-$50.00');
    });

    it('should format transfer transaction', () => {
      const transaction: Transaction = {
        id: 'txn-999',
        accountNumber: '0000012345',
        type: TransactionType.TRANSFER,
        amount: 2000,
        balanceBefore: 10000,
        balanceAfter: 8000,
        timestamp: new Date('2024-01-15T14:30:45.000Z'),
        status: TransactionStatus.COMPLETED,
      };

      const formatted = formatTransaction(transaction);

      expect(formatted).toContain('TRANSFER');
      expect(formatted).toContain('$20.00');
    });
  });

  describe('parseCurrency', () => {
    it('should parse dollar amount with symbol', () => {
      expect(parseCurrency('$100.00')).toBe(10000);
      expect(parseCurrency('$50.50')).toBe(5050);
      expect(parseCurrency('$0.01')).toBe(1);
    });

    it('should parse dollar amount without symbol', () => {
      expect(parseCurrency('100.00')).toBe(10000);
      expect(parseCurrency('50.50')).toBe(5050);
      expect(parseCurrency('0.01')).toBe(1);
    });

    it('should parse integer amounts', () => {
      expect(parseCurrency('100')).toBe(10000);
      expect(parseCurrency('$50')).toBe(5000);
    });

    it('should handle whitespace', () => {
      expect(parseCurrency('  $100.00  ')).toBe(10000);
      expect(parseCurrency('  100  ')).toBe(10000);
    });

    it('should handle zero', () => {
      expect(parseCurrency('0')).toBe(0);
      expect(parseCurrency('$0.00')).toBe(0);
    });

    it('should return null for invalid input', () => {
      expect(parseCurrency('abc')).toBeNull();
      expect(parseCurrency('$abc')).toBeNull();
      expect(parseCurrency('')).toBeNull();
    });

    it('should return null for negative amounts', () => {
      expect(parseCurrency('-100')).toBeNull();
      expect(parseCurrency('$-50.00')).toBeNull();
    });

    it('should round to nearest cent', () => {
      expect(parseCurrency('100.005')).toBe(10001);
      expect(parseCurrency('100.004')).toBe(10000);
      expect(parseCurrency('100.999')).toBe(10100);
    });

    it('should handle large amounts', () => {
      expect(parseCurrency('10000000.00')).toBe(1000000000); // $10 million
      expect(parseCurrency('9999999.99')).toBe(999999999);
    });
  });

  describe('formatAccountNumber', () => {
    it('should display full account number by default', () => {
      expect(formatAccountNumber('0000012345')).toBe('0000012345');
      expect(formatAccountNumber('1234567890')).toBe('1234567890');
    });

    it('should display full account number when mask is false', () => {
      expect(formatAccountNumber('0000012345', false)).toBe('0000012345');
    });

    it('should mask account number when mask is true', () => {
      expect(formatAccountNumber('0000012345', true)).toBe('******2345');
      expect(formatAccountNumber('1234567890', true)).toBe('******7890');
    });

    it('should not mask non-10-digit account numbers', () => {
      expect(formatAccountNumber('12345', true)).toBe('12345');
      expect(formatAccountNumber('123', true)).toBe('123');
    });
  });
});
