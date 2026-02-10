import { describe, it, expect } from '@jest/globals';
import {
  TransactionSchema,
  CreateTransactionSchema,
  TransactionType,
  TransactionStatus,
} from '../../src/models/Transaction';

describe('Transaction Model', () => {
  describe('TransactionSchema', () => {
    it('should validate a valid transaction', () => {
      const validTransaction = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        accountNumber: '1234567890',
        type: TransactionType.DEPOSIT,
        amount: 5000,
        balanceBefore: 10000,
        balanceAfter: 15000,
        timestamp: new Date(),
        status: TransactionStatus.COMPLETED,
        description: 'Test deposit',
      };

      expect(() => TransactionSchema.parse(validTransaction)).not.toThrow();
    });

    it('should validate transaction without optional description', () => {
      const validTransaction = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        accountNumber: '1234567890',
        type: TransactionType.WITHDRAWAL,
        amount: 5000,
        balanceBefore: 10000,
        balanceAfter: 5000,
        timestamp: new Date(),
        status: TransactionStatus.COMPLETED,
      };

      expect(() => TransactionSchema.parse(validTransaction)).not.toThrow();
    });

    it('should reject transaction with invalid UUID', () => {
      const invalidTransaction = {
        id: 'not-a-valid-uuid',
        accountNumber: '1234567890',
        type: TransactionType.DEPOSIT,
        amount: 5000,
        balanceBefore: 10000,
        balanceAfter: 15000,
        timestamp: new Date(),
        status: TransactionStatus.COMPLETED,
      };

      expect(() => TransactionSchema.parse(invalidTransaction)).toThrow();
    });

    it('should reject transaction with invalid account number', () => {
      const invalidTransaction = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        accountNumber: '123', // Too short
        type: TransactionType.DEPOSIT,
        amount: 5000,
        balanceBefore: 10000,
        balanceAfter: 15000,
        timestamp: new Date(),
        status: TransactionStatus.COMPLETED,
      };

      expect(() => TransactionSchema.parse(invalidTransaction)).toThrow();
    });

    it('should reject transaction with invalid type', () => {
      const invalidTransaction = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        accountNumber: '1234567890',
        type: 'invalid-type',
        amount: 5000,
        balanceBefore: 10000,
        balanceAfter: 15000,
        timestamp: new Date(),
        status: TransactionStatus.COMPLETED,
      };

      expect(() => TransactionSchema.parse(invalidTransaction)).toThrow();
    });

    it('should reject transaction with zero amount', () => {
      const invalidTransaction = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        accountNumber: '1234567890',
        type: TransactionType.DEPOSIT,
        amount: 0, // Must be positive
        balanceBefore: 10000,
        balanceAfter: 10000,
        timestamp: new Date(),
        status: TransactionStatus.COMPLETED,
      };

      expect(() => TransactionSchema.parse(invalidTransaction)).toThrow();
    });

    it('should reject transaction with negative amount', () => {
      const invalidTransaction = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        accountNumber: '1234567890',
        type: TransactionType.DEPOSIT,
        amount: -5000, // Must be positive
        balanceBefore: 10000,
        balanceAfter: 15000,
        timestamp: new Date(),
        status: TransactionStatus.COMPLETED,
      };

      expect(() => TransactionSchema.parse(invalidTransaction)).toThrow();
    });

    it('should reject transaction with non-integer amount', () => {
      const invalidTransaction = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        accountNumber: '1234567890',
        type: TransactionType.DEPOSIT,
        amount: 50.5, // Must be integer
        balanceBefore: 10000,
        balanceAfter: 10050,
        timestamp: new Date(),
        status: TransactionStatus.COMPLETED,
      };

      expect(() => TransactionSchema.parse(invalidTransaction)).toThrow();
    });

    it('should allow negative balance before and after (overdraft)', () => {
      const transactionWithOverdraft = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        accountNumber: '1234567890',
        type: TransactionType.WITHDRAWAL,
        amount: 5000,
        balanceBefore: -1000,
        balanceAfter: -6000, // Negative balances allowed
        timestamp: new Date(),
        status: TransactionStatus.COMPLETED,
      };

      expect(() => TransactionSchema.parse(transactionWithOverdraft)).not.toThrow();
    });

    it('should reject transaction with invalid status', () => {
      const invalidTransaction = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        accountNumber: '1234567890',
        type: TransactionType.DEPOSIT,
        amount: 5000,
        balanceBefore: 10000,
        balanceAfter: 15000,
        timestamp: new Date(),
        status: 'invalid-status',
      };

      expect(() => TransactionSchema.parse(invalidTransaction)).toThrow();
    });
  });

  describe('CreateTransactionSchema', () => {
    it('should validate transaction creation without ID and timestamp', () => {
      const createTransaction = {
        accountNumber: '1234567890',
        type: TransactionType.DEPOSIT,
        amount: 5000,
        balanceBefore: 10000,
        balanceAfter: 15000,
        status: TransactionStatus.COMPLETED,
        description: 'Test deposit',
      };

      expect(() => CreateTransactionSchema.parse(createTransaction)).not.toThrow();
    });

    it('should reject if ID or timestamp are provided', () => {
      const createTransaction = {
        id: '123e4567-e89b-12d3-a456-426614174000', // Should not be provided
        accountNumber: '1234567890',
        type: TransactionType.DEPOSIT,
        amount: 5000,
        balanceBefore: 10000,
        balanceAfter: 15000,
        timestamp: new Date(), // Should not be provided
        status: TransactionStatus.COMPLETED,
      };

      // CreateTransactionSchema omits id and timestamp
      const parsed = CreateTransactionSchema.parse(createTransaction);
      expect(parsed).not.toHaveProperty('id');
      expect(parsed).not.toHaveProperty('timestamp');
    });
  });

  describe('TransactionType enum', () => {
    it('should have correct values', () => {
      expect(TransactionType.DEPOSIT).toBe('deposit');
      expect(TransactionType.WITHDRAWAL).toBe('withdrawal');
      expect(TransactionType.TRANSFER).toBe('transfer');
    });
  });

  describe('TransactionStatus enum', () => {
    it('should have correct values', () => {
      expect(TransactionStatus.PENDING).toBe('pending');
      expect(TransactionStatus.COMPLETED).toBe('completed');
      expect(TransactionStatus.FAILED).toBe('failed');
    });
  });
});
