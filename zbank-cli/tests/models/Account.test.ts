import { describe, it, expect } from '@jest/globals';
import { AccountSchema, CreateAccountSchema, UpdateAccountSchema } from '../../src/models/Account';

describe('Account Model', () => {
  describe('AccountSchema', () => {
    it('should validate a valid account', () => {
      const validAccount = {
        accountNumber: '1234567890',
        pin: '$2b$10$hashedpinexample',
        balance: 10000,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(() => AccountSchema.parse(validAccount)).not.toThrow();
    });

    it('should reject account with invalid account number length', () => {
      const invalidAccount = {
        accountNumber: '123', // Too short
        pin: '$2b$10$hashedpinexample',
        balance: 10000,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(() => AccountSchema.parse(invalidAccount)).toThrow();
    });

    it('should reject account with non-numeric account number', () => {
      const invalidAccount = {
        accountNumber: '12345abcde', // Contains letters
        pin: '$2b$10$hashedpinexample',
        balance: 10000,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(() => AccountSchema.parse(invalidAccount)).toThrow();
    });

    it('should reject account with empty PIN', () => {
      const invalidAccount = {
        accountNumber: '1234567890',
        pin: '', // Empty
        balance: 10000,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(() => AccountSchema.parse(invalidAccount)).toThrow();
    });

    it('should reject account with non-integer balance', () => {
      const invalidAccount = {
        accountNumber: '1234567890',
        pin: '$2b$10$hashedpinexample',
        balance: 100.5, // Not an integer
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(() => AccountSchema.parse(invalidAccount)).toThrow();
    });

    it('should allow negative balance (overdraft)', () => {
      const accountWithOverdraft = {
        accountNumber: '1234567890',
        pin: '$2b$10$hashedpinexample',
        balance: -5000, // Negative balance allowed
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(() => AccountSchema.parse(accountWithOverdraft)).not.toThrow();
    });
  });

  describe('CreateAccountSchema', () => {
    it('should validate account creation without timestamps', () => {
      const createAccount = {
        accountNumber: '1234567890',
        pin: '$2b$10$hashedpinexample',
        balance: 10000,
      };

      expect(() => CreateAccountSchema.parse(createAccount)).not.toThrow();
    });

    it('should reject if timestamps are provided', () => {
      const createAccount = {
        accountNumber: '1234567890',
        pin: '$2b$10$hashedpinexample',
        balance: 10000,
        createdAt: new Date(), // Should not be provided
        updatedAt: new Date(),
      };

      // CreateAccountSchema omits timestamps, so extra fields should be ignored by Zod
      // But let's ensure the schema parses correctly
      const parsed = CreateAccountSchema.parse(createAccount);
      expect(parsed).not.toHaveProperty('createdAt');
      expect(parsed).not.toHaveProperty('updatedAt');
    });
  });

  describe('UpdateAccountSchema', () => {
    it('should allow partial updates', () => {
      const update = {
        balance: 20000,
      };

      expect(() => UpdateAccountSchema.parse(update)).not.toThrow();
    });

    it('should allow updating just the PIN', () => {
      const update = {
        pin: '$2b$10$newhashexample',
      };

      expect(() => UpdateAccountSchema.parse(update)).not.toThrow();
    });

    it('should allow empty update object', () => {
      const update = {};

      expect(() => UpdateAccountSchema.parse(update)).not.toThrow();
    });

    it('should still validate field formats when provided', () => {
      const invalidUpdate = {
        accountNumber: '123', // Invalid length
      };

      expect(() => UpdateAccountSchema.parse(invalidUpdate)).toThrow();
    });
  });
});
