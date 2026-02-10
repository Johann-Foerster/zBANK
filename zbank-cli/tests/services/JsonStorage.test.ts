import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { promises as fs } from 'fs';
import * as path from 'path';
import { JsonStorage } from '../../src/services/JsonStorage';
import { TransactionType, TransactionStatus } from '../../src/models/Transaction';

describe('JsonStorage', () => {
  const testDataDir = path.join(process.cwd(), 'tests', '.test-data');
  let storage: JsonStorage;

  beforeEach(async () => {
    // Create test data directory
    await fs.mkdir(testDataDir, { recursive: true });
    storage = new JsonStorage(testDataDir);
    await storage.initialize();
  });

  afterEach(async () => {
    // Clean up test data directory
    try {
      await fs.rm(testDataDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore errors during cleanup
    }
  });

  describe('Account Operations', () => {
    describe('createAccount', () => {
      it('should create a new account with timestamps', async () => {
        const account = await storage.createAccount({
          accountNumber: '1234567890',
          pin: '$2b$10$hashedpin',
          balance: 10000,
        });

        expect(account.accountNumber).toBe('1234567890');
        expect(account.pin).toBe('$2b$10$hashedpin');
        expect(account.balance).toBe(10000);
        expect(account.createdAt).toBeInstanceOf(Date);
        expect(account.updatedAt).toBeInstanceOf(Date);
      });

      it('should throw error when creating duplicate account', async () => {
        await storage.createAccount({
          accountNumber: '1234567890',
          pin: '$2b$10$hashedpin',
          balance: 10000,
        });

        await expect(
          storage.createAccount({
            accountNumber: '1234567890',
            pin: '$2b$10$anotherpin',
            balance: 20000,
          })
        ).rejects.toThrow('already exists');
      });
    });

    describe('getAccount', () => {
      it('should retrieve an existing account', async () => {
        await storage.createAccount({
          accountNumber: '1234567890',
          pin: '$2b$10$hashedpin',
          balance: 10000,
        });

        const account = await storage.getAccount('1234567890');
        expect(account).not.toBeNull();
        expect(account?.accountNumber).toBe('1234567890');
        expect(account?.balance).toBe(10000);
      });

      it('should return null for non-existent account', async () => {
        const account = await storage.getAccount('9999999999');
        expect(account).toBeNull();
      });
    });

    describe('updateAccount', () => {
      it('should update account balance', async () => {
        await storage.createAccount({
          accountNumber: '1234567890',
          pin: '$2b$10$hashedpin',
          balance: 10000,
        });

        const updated = await storage.updateAccount('1234567890', {
          balance: 15000,
        });

        expect(updated.balance).toBe(15000);
        expect(updated.updatedAt.getTime()).toBeGreaterThan(updated.createdAt.getTime());
      });

      it('should update account PIN', async () => {
        await storage.createAccount({
          accountNumber: '1234567890',
          pin: '$2b$10$hashedpin',
          balance: 10000,
        });

        const updated = await storage.updateAccount('1234567890', {
          pin: '$2b$10$newhashedpin',
        });

        expect(updated.pin).toBe('$2b$10$newhashedpin');
      });

      it('should throw error when updating non-existent account', async () => {
        await expect(
          storage.updateAccount('9999999999', { balance: 10000 })
        ).rejects.toThrow('not found');
      });

      it('should not allow changing account number', async () => {
        await storage.createAccount({
          accountNumber: '1234567890',
          pin: '$2b$10$hashedpin',
          balance: 10000,
        });

        const updated = await storage.updateAccount('1234567890', {
          accountNumber: '0987654321' as any, // Try to change it
          balance: 15000,
        });

        // Account number should remain unchanged
        expect(updated.accountNumber).toBe('1234567890');
      });
    });

    describe('deleteAccount', () => {
      it('should delete an existing account', async () => {
        await storage.createAccount({
          accountNumber: '1234567890',
          pin: '$2b$10$hashedpin',
          balance: 10000,
        });

        const deleted = await storage.deleteAccount('1234567890');
        expect(deleted).toBe(true);

        const account = await storage.getAccount('1234567890');
        expect(account).toBeNull();
      });

      it('should return false when deleting non-existent account', async () => {
        const deleted = await storage.deleteAccount('9999999999');
        expect(deleted).toBe(false);
      });
    });

    describe('listAccounts', () => {
      it('should return empty array when no accounts exist', async () => {
        const accounts = await storage.listAccounts();
        expect(accounts).toEqual([]);
      });

      it('should return all accounts', async () => {
        await storage.createAccount({
          accountNumber: '1234567890',
          pin: '$2b$10$hashedpin1',
          balance: 10000,
        });

        await storage.createAccount({
          accountNumber: '0987654321',
          pin: '$2b$10$hashedpin2',
          balance: 20000,
        });

        const accounts = await storage.listAccounts();
        expect(accounts).toHaveLength(2);
        expect(accounts.map(a => a.accountNumber).sort()).toEqual([
          '0987654321',
          '1234567890',
        ]);
      });
    });
  });

  describe('Transaction Operations', () => {
    beforeEach(async () => {
      // Create test account
      await storage.createAccount({
        accountNumber: '1234567890',
        pin: '$2b$10$hashedpin',
        balance: 10000,
      });
    });

    describe('addTransaction', () => {
      it('should add a transaction with ID and timestamp', async () => {
        const transaction = await storage.addTransaction({
          accountNumber: '1234567890',
          type: TransactionType.DEPOSIT,
          amount: 5000,
          balanceBefore: 10000,
          balanceAfter: 15000,
          status: TransactionStatus.COMPLETED,
          description: 'Test deposit',
        });

        expect(transaction.id).toBeDefined();
        expect(transaction.timestamp).toBeInstanceOf(Date);
        expect(transaction.accountNumber).toBe('1234567890');
        expect(transaction.type).toBe(TransactionType.DEPOSIT);
        expect(transaction.amount).toBe(5000);
      });

      it('should generate unique IDs for transactions', async () => {
        const txn1 = await storage.addTransaction({
          accountNumber: '1234567890',
          type: TransactionType.DEPOSIT,
          amount: 5000,
          balanceBefore: 10000,
          balanceAfter: 15000,
          status: TransactionStatus.COMPLETED,
        });

        const txn2 = await storage.addTransaction({
          accountNumber: '1234567890',
          type: TransactionType.WITHDRAWAL,
          amount: 3000,
          balanceBefore: 15000,
          balanceAfter: 12000,
          status: TransactionStatus.COMPLETED,
        });

        expect(txn1.id).not.toBe(txn2.id);
      });
    });

    describe('getTransactionHistory', () => {
      it('should return empty array when no transactions exist', async () => {
        const history = await storage.getTransactionHistory('1234567890');
        expect(history).toEqual([]);
      });

      it('should return transactions for specific account', async () => {
        // Add transactions for first account
        await storage.addTransaction({
          accountNumber: '1234567890',
          type: TransactionType.DEPOSIT,
          amount: 5000,
          balanceBefore: 10000,
          balanceAfter: 15000,
          status: TransactionStatus.COMPLETED,
        });

        await storage.addTransaction({
          accountNumber: '1234567890',
          type: TransactionType.WITHDRAWAL,
          amount: 3000,
          balanceBefore: 15000,
          balanceAfter: 12000,
          status: TransactionStatus.COMPLETED,
        });

        // Create second account and add transaction
        await storage.createAccount({
          accountNumber: '0987654321',
          pin: '$2b$10$hashedpin2',
          balance: 20000,
        });

        await storage.addTransaction({
          accountNumber: '0987654321',
          type: TransactionType.DEPOSIT,
          amount: 1000,
          balanceBefore: 20000,
          balanceAfter: 21000,
          status: TransactionStatus.COMPLETED,
        });

        // Check first account history
        const history1 = await storage.getTransactionHistory('1234567890');
        expect(history1).toHaveLength(2);
        expect(history1.every(t => t.accountNumber === '1234567890')).toBe(true);

        // Check second account history
        const history2 = await storage.getTransactionHistory('0987654321');
        expect(history2).toHaveLength(1);
        expect(history2[0].accountNumber).toBe('0987654321');
      });

      it('should return transactions in reverse chronological order', async () => {
        // Add transactions with small delays to ensure different timestamps
        await storage.addTransaction({
          accountNumber: '1234567890',
          type: TransactionType.DEPOSIT,
          amount: 1000,
          balanceBefore: 10000,
          balanceAfter: 11000,
          status: TransactionStatus.COMPLETED,
        });

        await new Promise(resolve => setTimeout(resolve, 10)); // Small delay

        await storage.addTransaction({
          accountNumber: '1234567890',
          type: TransactionType.DEPOSIT,
          amount: 2000,
          balanceBefore: 11000,
          balanceAfter: 13000,
          status: TransactionStatus.COMPLETED,
        });

        await new Promise(resolve => setTimeout(resolve, 10)); // Small delay

        await storage.addTransaction({
          accountNumber: '1234567890',
          type: TransactionType.DEPOSIT,
          amount: 3000,
          balanceBefore: 13000,
          balanceAfter: 16000,
          status: TransactionStatus.COMPLETED,
        });

        const history = await storage.getTransactionHistory('1234567890');
        
        // Most recent first
        expect(history[0].amount).toBe(3000);
        expect(history[1].amount).toBe(2000);
        expect(history[2].amount).toBe(1000);
      });

      it('should respect limit parameter', async () => {
        // Add multiple transactions
        for (let i = 0; i < 5; i++) {
          await storage.addTransaction({
            accountNumber: '1234567890',
            type: TransactionType.DEPOSIT,
            amount: 1000 * (i + 1),
            balanceBefore: 10000,
            balanceAfter: 10000 + 1000 * (i + 1),
            status: TransactionStatus.COMPLETED,
          });
        }

        const history = await storage.getTransactionHistory('1234567890', 3);
        expect(history).toHaveLength(3);
      });
    });
  });

  describe('Account Locking', () => {
    it('should lock and unlock an account', async () => {
      const locked = await storage.lockAccount('1234567890');
      expect(locked).toBe(true);

      const unlocked = await storage.unlockAccount('1234567890');
      expect(unlocked).toBe(true);
    });

    it('should not allow locking already locked account', async () => {
      const locked1 = await storage.lockAccount('1234567890');
      expect(locked1).toBe(true);

      const locked2 = await storage.lockAccount('1234567890');
      expect(locked2).toBe(false);
    });

    it('should return false when unlocking non-locked account', async () => {
      const unlocked = await storage.unlockAccount('1234567890');
      expect(unlocked).toBe(false);
    });

    it('should allow locking after unlocking', async () => {
      await storage.lockAccount('1234567890');
      await storage.unlockAccount('1234567890');

      const locked = await storage.lockAccount('1234567890');
      expect(locked).toBe(true);
    });
  });

  describe('Data Persistence', () => {
    it('should persist accounts across storage instances', async () => {
      // Create account with first storage instance
      await storage.createAccount({
        accountNumber: '1234567890',
        pin: '$2b$10$hashedpin',
        balance: 10000,
      });

      // Create new storage instance with same data directory
      const storage2 = new JsonStorage(testDataDir);
      await storage2.initialize();

      // Retrieve account with second instance
      const account = await storage2.getAccount('1234567890');
      expect(account).not.toBeNull();
      expect(account?.balance).toBe(10000);
    });

    it('should persist transactions across storage instances', async () => {
      // Create account and transaction
      await storage.createAccount({
        accountNumber: '1234567890',
        pin: '$2b$10$hashedpin',
        balance: 10000,
      });

      await storage.addTransaction({
        accountNumber: '1234567890',
        type: TransactionType.DEPOSIT,
        amount: 5000,
        balanceBefore: 10000,
        balanceAfter: 15000,
        status: TransactionStatus.COMPLETED,
      });

      // Create new storage instance
      const storage2 = new JsonStorage(testDataDir);
      await storage2.initialize();

      // Retrieve transaction history
      const history = await storage2.getTransactionHistory('1234567890');
      expect(history).toHaveLength(1);
      expect(history[0].amount).toBe(5000);
    });
  });
});
