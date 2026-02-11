import { describe, it, expect, beforeEach } from '@jest/globals';
import { TransactionService } from '../../src/services/TransactionService.js';
import { IStorage } from '../../src/services/IStorage.js';
import { Account } from '../../src/models/Account.js';
import { Transaction, TransactionType, TransactionStatus } from '../../src/models/Transaction.js';
import { CreateTransaction } from '../../src/models/Transaction.js';

/**
 * Mock storage implementation for testing
 */
class MockStorage implements IStorage {
  private accounts: Map<string, Account> = new Map();
  private transactions: Transaction[] = [];
  private locks: Set<string> = new Set();
  private transactionIdCounter = 1;

  async getAccount(accountNumber: string): Promise<Account | null> {
    return this.accounts.get(accountNumber) || null;
  }

  async createAccount(account: Omit<Account, 'createdAt' | 'updatedAt'>): Promise<Account> {
    const newAccount: Account = {
      ...account,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.accounts.set(account.accountNumber, newAccount);
    return newAccount;
  }

  async updateAccount(
    accountNumber: string,
    updates: Partial<Omit<Account, 'accountNumber' | 'createdAt'>>
  ): Promise<Account> {
    const account = this.accounts.get(accountNumber);
    if (!account) {
      throw new Error('Account not found');
    }
    const updatedAccount = {
      ...account,
      ...updates,
      updatedAt: new Date(),
    };
    this.accounts.set(accountNumber, updatedAccount);
    return updatedAccount;
  }

  async deleteAccount(accountNumber: string): Promise<boolean> {
    if (!this.accounts.has(accountNumber)) {
      return false;
    }
    this.accounts.delete(accountNumber);
    return true;
  }

  async listAccounts(): Promise<Account[]> {
    return Array.from(this.accounts.values());
  }

  async addTransaction(transaction: CreateTransaction): Promise<Transaction> {
    const newTransaction: Transaction = {
      id: `txn-${this.transactionIdCounter++}`,
      ...transaction,
      timestamp: new Date(),
    };
    this.transactions.push(newTransaction);
    return newTransaction;
  }

  async getTransactionHistory(accountNumber: string, limit?: number): Promise<Transaction[]> {
    const accountTransactions = this.transactions
      .filter((t) => t.accountNumber === accountNumber)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return limit ? accountTransactions.slice(0, limit) : accountTransactions;
  }

  async lockAccount(accountNumber: string): Promise<boolean> {
    if (this.locks.has(accountNumber)) {
      return false;
    }
    this.locks.add(accountNumber);
    return true;
  }

  async unlockAccount(accountNumber: string): Promise<boolean> {
    if (!this.locks.has(accountNumber)) {
      return false;
    }
    this.locks.delete(accountNumber);
    return true;
  }

  // Helper method for tests
  reset() {
    this.accounts.clear();
    this.transactions = [];
    this.locks.clear();
    this.transactionIdCounter = 1;
  }
}

describe('TransactionService', () => {
  let service: TransactionService;
  let storage: MockStorage;

  beforeEach(() => {
    storage = new MockStorage();
    service = new TransactionService(storage);
  });

  describe('deposit', () => {
    beforeEach(async () => {
      await storage.createAccount({
        accountNumber: '0000012345',
        pin: 'hashed_pin',
        balance: 10000, // $100.00
      });
    });

    it('should add amount to balance', async () => {
      const result = await service.deposit('0000012345', 5000); // $50.00

      expect(result.success).toBe(true);
      expect(result.newBalance).toBe(15000); // $150.00
      expect(result.transaction).toBeDefined();
      expect(result.transaction?.type).toBe(TransactionType.DEPOSIT);
      expect(result.transaction?.amount).toBe(5000);
      expect(result.error).toBeUndefined();
    });

    it('should update account balance in storage', async () => {
      await service.deposit('0000012345', 5000);

      const account = await storage.getAccount('0000012345');
      expect(account?.balance).toBe(15000);
    });

    it('should record transaction with balance snapshots', async () => {
      const result = await service.deposit('0000012345', 5000);

      expect(result.transaction?.balanceBefore).toBe(10000);
      expect(result.transaction?.balanceAfter).toBe(15000);
      expect(result.transaction?.status).toBe(TransactionStatus.COMPLETED);
    });

    it('should reject negative amounts', async () => {
      const result = await service.deposit('0000012345', -1000);

      expect(result.success).toBe(false);
      expect(result.error).toContain('greater than zero');
      expect(result.transaction).toBeUndefined();
    });

    it('should reject zero amount', async () => {
      const result = await service.deposit('0000012345', 0);

      expect(result.success).toBe(false);
      expect(result.error).toContain('greater than zero');
    });

    it('should reject non-integer amounts', async () => {
      const result = await service.deposit('0000012345', 50.5);

      expect(result.success).toBe(false);
      expect(result.error).toContain('whole number');
    });

    it('should reject amounts exceeding maximum limit', async () => {
      const result = await service.deposit('0000012345', 1000000001);

      expect(result.success).toBe(false);
      expect(result.error).toContain('maximum limit');
    });

    it('should reject deposit to non-existent account', async () => {
      const result = await service.deposit('9999999999', 5000);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Account not found');
    });

    it('should handle multiple deposits correctly', async () => {
      await service.deposit('0000012345', 1000);
      await service.deposit('0000012345', 2000);
      const result = await service.deposit('0000012345', 3000);

      expect(result.success).toBe(true);
      expect(result.newBalance).toBe(16000); // 10000 + 1000 + 2000 + 3000
    });

    it('should allow deposit to negative balance account', async () => {
      // Create account with negative balance
      await storage.createAccount({
        accountNumber: '1111111111',
        pin: 'hashed_pin',
        balance: -5000, // -$50.00
      });

      const result = await service.deposit('1111111111', 10000);

      expect(result.success).toBe(true);
      expect(result.newBalance).toBe(5000); // -5000 + 10000 = 5000
    });
  });

  describe('withdraw', () => {
    beforeEach(async () => {
      await storage.createAccount({
        accountNumber: '0000012345',
        pin: 'hashed_pin',
        balance: 10000, // $100.00
      });
    });

    it('should subtract amount from balance', async () => {
      const result = await service.withdraw('0000012345', 3000); // $30.00

      expect(result.success).toBe(true);
      expect(result.newBalance).toBe(7000); // $70.00
      expect(result.transaction).toBeDefined();
      expect(result.transaction?.type).toBe(TransactionType.WITHDRAWAL);
      expect(result.error).toBeUndefined();
    });

    it('should allow withdrawal exceeding balance (matching COBOL behavior)', async () => {
      // IMPORTANT: This matches COBOL's behavior of allowing negative balances
      const result = await service.withdraw('0000012345', 15000); // $150.00

      expect(result.success).toBe(true);
      expect(result.newBalance).toBe(-5000); // $-50.00 (negative balance allowed)
      expect(result.transaction).toBeDefined();
    });

    it('should update account balance in storage', async () => {
      await service.withdraw('0000012345', 3000);

      const account = await storage.getAccount('0000012345');
      expect(account?.balance).toBe(7000);
    });

    it('should record transaction with balance snapshots', async () => {
      const result = await service.withdraw('0000012345', 3000);

      expect(result.transaction?.balanceBefore).toBe(10000);
      expect(result.transaction?.balanceAfter).toBe(7000);
      expect(result.transaction?.status).toBe(TransactionStatus.COMPLETED);
    });

    it('should reject negative amounts', async () => {
      const result = await service.withdraw('0000012345', -1000);

      expect(result.success).toBe(false);
      expect(result.error).toContain('greater than zero');
    });

    it('should reject zero amount', async () => {
      const result = await service.withdraw('0000012345', 0);

      expect(result.success).toBe(false);
      expect(result.error).toContain('greater than zero');
    });

    it('should reject non-integer amounts', async () => {
      const result = await service.withdraw('0000012345', 30.5);

      expect(result.success).toBe(false);
      expect(result.error).toContain('whole number');
    });

    it('should reject amounts exceeding maximum limit', async () => {
      const result = await service.withdraw('0000012345', 1000000001);

      expect(result.success).toBe(false);
      expect(result.error).toContain('maximum limit');
    });

    it('should reject withdrawal from non-existent account', async () => {
      const result = await service.withdraw('9999999999', 5000);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Account not found');
    });

    it('should handle multiple withdrawals correctly', async () => {
      await service.withdraw('0000012345', 1000);
      await service.withdraw('0000012345', 2000);
      const result = await service.withdraw('0000012345', 3000);

      expect(result.success).toBe(true);
      expect(result.newBalance).toBe(4000); // 10000 - 1000 - 2000 - 3000
    });

    it('should allow withdrawal from negative balance account', async () => {
      // Create account with negative balance
      await storage.createAccount({
        accountNumber: '1111111111',
        pin: 'hashed_pin',
        balance: -5000, // -$50.00
      });

      const result = await service.withdraw('1111111111', 3000);

      expect(result.success).toBe(true);
      expect(result.newBalance).toBe(-8000); // -5000 - 3000 = -8000
    });
  });

  describe('transfer', () => {
    beforeEach(async () => {
      await storage.createAccount({
        accountNumber: '0000012345',
        pin: 'hashed_pin',
        balance: 10000,
      });
      await storage.createAccount({
        accountNumber: '1234567890',
        pin: 'hashed_pin',
        balance: 20000,
      });
    });

    it('should return not implemented error (matching COBOL)', async () => {
      const result = await service.transfer('0000012345', '1234567890', 5000);

      expect(result.success).toBe(false);
      expect(result.error).toContain('not implemented');
      expect(result.error).toContain('COBOL');
      expect(result.transaction).toBeUndefined();
    });

    it('should not modify any accounts', async () => {
      await service.transfer('0000012345', '1234567890', 5000);

      const account1 = await storage.getAccount('0000012345');
      const account2 = await storage.getAccount('1234567890');

      expect(account1?.balance).toBe(10000); // Unchanged
      expect(account2?.balance).toBe(20000); // Unchanged
    });

    it('should not create any transactions', async () => {
      await service.transfer('0000012345', '1234567890', 5000);

      const history1 = await storage.getTransactionHistory('0000012345');
      const history2 = await storage.getTransactionHistory('1234567890');

      expect(history1.length).toBe(0);
      expect(history2.length).toBe(0);
    });
  });

  describe('getBalance', () => {
    it('should return current balance', async () => {
      await storage.createAccount({
        accountNumber: '0000012345',
        pin: 'hashed_pin',
        balance: 10000,
      });

      const balance = await service.getBalance('0000012345');
      expect(balance).toBe(10000);
    });

    it('should throw error for non-existent account', async () => {
      await expect(service.getBalance('9999999999')).rejects.toThrow('Account not found');
    });

    it('should return negative balance', async () => {
      await storage.createAccount({
        accountNumber: '0000012345',
        pin: 'hashed_pin',
        balance: -5000,
      });

      const balance = await service.getBalance('0000012345');
      expect(balance).toBe(-5000);
    });

    it('should return updated balance after transaction', async () => {
      await storage.createAccount({
        accountNumber: '0000012345',
        pin: 'hashed_pin',
        balance: 10000,
      });

      await service.deposit('0000012345', 5000);
      const balance = await service.getBalance('0000012345');

      expect(balance).toBe(15000);
    });
  });

  describe('validateAmount', () => {
    it('should accept valid positive integer', () => {
      const result = service.validateAmount(10000);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept maximum allowed amount', () => {
      const result = service.validateAmount(1000000000);
      expect(result.valid).toBe(true);
    });

    it('should reject zero', () => {
      const result = service.validateAmount(0);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('greater than zero');
    });

    it('should reject negative amount', () => {
      const result = service.validateAmount(-1000);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('greater than zero');
    });

    it('should reject non-integer', () => {
      const result = service.validateAmount(100.5);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('whole number');
    });

    it('should reject amount exceeding maximum', () => {
      const result = service.validateAmount(1000000001);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('maximum limit');
    });

    it('should accept amount just below maximum', () => {
      const result = service.validateAmount(999999999);
      expect(result.valid).toBe(true);
    });
  });

  describe('COBOL behavior compliance', () => {
    it('should allow overdrafts like COBOL', async () => {
      await storage.createAccount({
        accountNumber: '0000012345',
        pin: 'hashed_pin',
        balance: 10000, // $100.00
      });

      // Withdraw more than balance
      const result = await service.withdraw('0000012345', 15000); // $150.00

      expect(result.success).toBe(true);
      expect(result.newBalance).toBe(-5000); // Negative balance allowed
    });

    it('should not prevent multiple overdrafts', async () => {
      await storage.createAccount({
        accountNumber: '0000012345',
        pin: 'hashed_pin',
        balance: 10000,
      });

      await service.withdraw('0000012345', 15000);
      const result = await service.withdraw('0000012345', 10000);

      expect(result.success).toBe(true);
      expect(result.newBalance).toBe(-15000);
    });

    it('should allow deposits to recover from negative balance', async () => {
      await storage.createAccount({
        accountNumber: '0000012345',
        pin: 'hashed_pin',
        balance: -5000,
      });

      const result = await service.deposit('0000012345', 10000);

      expect(result.success).toBe(true);
      expect(result.newBalance).toBe(5000);
    });
  });

  describe('transaction history', () => {
    beforeEach(async () => {
      await storage.createAccount({
        accountNumber: '0000012345',
        pin: 'hashed_pin',
        balance: 10000,
      });
    });

    it('should record all transactions', async () => {
      await service.deposit('0000012345', 5000);
      await service.withdraw('0000012345', 3000);
      await service.deposit('0000012345', 2000);

      const history = await storage.getTransactionHistory('0000012345');
      expect(history.length).toBe(3);
    });

    it('should track balance changes across transactions', async () => {
      await service.deposit('0000012345', 5000);
      
      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));
      
      await service.withdraw('0000012345', 3000);

      const history = await storage.getTransactionHistory('0000012345');

      // Transactions are in reverse chronological order (most recent first)
      // First transaction in history (most recent) = withdrawal
      expect(history[0].type).toBe(TransactionType.WITHDRAWAL);
      expect(history[0].balanceBefore).toBe(15000);
      expect(history[0].balanceAfter).toBe(12000);

      // Second transaction in history = deposit
      expect(history[1].type).toBe(TransactionType.DEPOSIT);
      expect(history[1].balanceBefore).toBe(10000);
      expect(history[1].balanceAfter).toBe(15000);
    });
  });

  describe('edge cases', () => {
    it('should handle very large deposits', async () => {
      await storage.createAccount({
        accountNumber: '0000012345',
        pin: 'hashed_pin',
        balance: 0,
      });

      const result = await service.deposit('0000012345', 999999999);

      expect(result.success).toBe(true);
      expect(result.newBalance).toBe(999999999);
    });

    it('should handle very large withdrawals', async () => {
      await storage.createAccount({
        accountNumber: '0000012345',
        pin: 'hashed_pin',
        balance: 1000000000,
      });

      const result = await service.withdraw('0000012345', 999999999);

      expect(result.success).toBe(true);
      expect(result.newBalance).toBe(1);
    });

    it('should handle transaction on zero balance account', async () => {
      await storage.createAccount({
        accountNumber: '0000012345',
        pin: 'hashed_pin',
        balance: 0,
      });

      const depositResult = await service.deposit('0000012345', 1000);
      expect(depositResult.success).toBe(true);
      expect(depositResult.newBalance).toBe(1000);

      const withdrawResult = await service.withdraw('0000012345', 500);
      expect(withdrawResult.success).toBe(true);
      expect(withdrawResult.newBalance).toBe(500);
    });
  });
});
