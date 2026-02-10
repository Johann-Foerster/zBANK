import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { AuthService } from '../../src/services/AuthService.js';
import { SessionManager } from '../../src/services/SessionManager.js';
import { IStorage } from '../../src/services/IStorage.js';
import { Account } from '../../src/models/Account.js';
import { hashPin } from '../../src/utils/crypto.js';

// Mock storage implementation
class MockStorage implements IStorage {
  private accounts: Map<string, Account> = new Map();
  private locks: Set<string> = new Set();

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

  async addTransaction(): Promise<any> {
    return {};
  }

  async getTransactionHistory(): Promise<any[]> {
    return [];
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

  async initialize(): Promise<void> {}
}

describe('AuthService', () => {
  let authService: AuthService;
  let storage: MockStorage;
  let sessionManager: SessionManager;
  let testAccount: Account;
  let hashedPin: string;

  beforeEach(async () => {
    storage = new MockStorage();
    sessionManager = new SessionManager();
    authService = new AuthService(storage, sessionManager);

    // Create a test account with hashed PIN
    hashedPin = await hashPin('1111');
    testAccount = await storage.createAccount({
      accountNumber: '0000012345',
      pin: hashedPin,
      balance: 10000,
    });
  });

  describe('login', () => {
    it('should login with valid credentials', async () => {
      const result = await authService.login('0000012345', '1111');

      expect(result.success).toBe(true);
      expect(result.account).toBeDefined();
      expect(result.account?.accountNumber).toBe('0000012345');
      expect(result.error).toBeUndefined();
      expect(authService.isAuthenticated()).toBe(true);
    });

    it('should reject invalid account number format', async () => {
      const result = await authService.login('123', '1111');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid account number format');
      expect(authService.isAuthenticated()).toBe(false);
    });

    it('should reject invalid PIN format', async () => {
      const result = await authService.login('0000012345', '12');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid PIN format');
      expect(authService.isAuthenticated()).toBe(false);
    });

    it('should reject non-existent account', async () => {
      const result = await authService.login('9999999999', '1111');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Account not found');
      expect(authService.isAuthenticated()).toBe(false);
    });

    it('should reject invalid PIN', async () => {
      const result = await authService.login('0000012345', '9999');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid PIN');
      expect(authService.isAuthenticated()).toBe(false);
    });

    it('should allow unlimited login attempts (matching COBOL behavior)', async () => {
      // Attempt to login with wrong PIN multiple times
      for (let i = 0; i < 10; i++) {
        const result = await authService.login('0000012345', '9999');
        expect(result.success).toBe(false);
        expect(result.error).toBe('Invalid PIN');
      }

      // Account should still be accessible
      const successResult = await authService.login('0000012345', '1111');
      expect(successResult.success).toBe(true);
    });

    it('should create a session on successful login', async () => {
      await authService.login('0000012345', '1111');

      const currentUser = authService.getCurrentUser();
      expect(currentUser).not.toBeNull();
      expect(currentUser?.accountNumber).toBe('0000012345');
    });

    it('should replace existing session with new login', async () => {
      // Create another test account
      const hashedPin2 = await hashPin('1234');
      await storage.createAccount({
        accountNumber: '1234567890',
        pin: hashedPin2,
        balance: 20000,
      });

      // Login with first account
      await authService.login('0000012345', '1111');
      expect(authService.getCurrentUser()?.accountNumber).toBe('0000012345');

      // Login with second account
      await authService.login('1234567890', '1234');
      expect(authService.getCurrentUser()?.accountNumber).toBe('1234567890');
    });
  });

  describe('logout', () => {
    it('should clear the session', async () => {
      await authService.login('0000012345', '1111');
      expect(authService.isAuthenticated()).toBe(true);

      await authService.logout();
      expect(authService.isAuthenticated()).toBe(false);
      expect(authService.getCurrentUser()).toBeNull();
    });

    it('should be safe to call when not logged in', async () => {
      await authService.logout();
      expect(authService.isAuthenticated()).toBe(false);
    });

    it('should unlock account on logout', async () => {
      await authService.login('0000012345', '1111');
      
      // Lock the account manually
      await storage.lockAccount('0000012345');
      
      await authService.logout();
      
      // Should be able to lock again (proving it was unlocked)
      const lockResult = await storage.lockAccount('0000012345');
      expect(lockResult).toBe(true);
    });
  });

  describe('getCurrentUser', () => {
    it('should return null when not authenticated', () => {
      expect(authService.getCurrentUser()).toBeNull();
    });

    it('should return current account when authenticated', async () => {
      await authService.login('0000012345', '1111');

      const currentUser = authService.getCurrentUser();
      expect(currentUser).not.toBeNull();
      expect(currentUser?.accountNumber).toBe('0000012345');
      expect(currentUser?.balance).toBe(10000);
    });
  });

  describe('isAuthenticated', () => {
    it('should return false when not logged in', () => {
      expect(authService.isAuthenticated()).toBe(false);
    });

    it('should return true when logged in', async () => {
      await authService.login('0000012345', '1111');
      expect(authService.isAuthenticated()).toBe(true);
    });

    it('should return false after logout', async () => {
      await authService.login('0000012345', '1111');
      await authService.logout();
      expect(authService.isAuthenticated()).toBe(false);
    });
  });

  describe('changePin', () => {
    it('should change PIN with valid old PIN', async () => {
      await authService.login('0000012345', '1111');

      const result = await authService.changePin('1111', '2222');
      expect(result).toBe(true);

      // Verify new PIN works
      await authService.logout();
      const loginResult = await authService.login('0000012345', '2222');
      expect(loginResult.success).toBe(true);
    });

    it('should reject PIN change when not authenticated', async () => {
      const result = await authService.changePin('1111', '2222');
      expect(result).toBe(false);
    });

    it('should reject PIN change with invalid old PIN', async () => {
      await authService.login('0000012345', '1111');

      const result = await authService.changePin('9999', '2222');
      expect(result).toBe(false);

      // Verify old PIN still works
      await authService.logout();
      const loginResult = await authService.login('0000012345', '1111');
      expect(loginResult.success).toBe(true);
    });

    it('should reject invalid new PIN format', async () => {
      await authService.login('0000012345', '1111');

      const result = await authService.changePin('1111', '12'); // Too short
      expect(result).toBe(false);
    });

    it('should update session after PIN change', async () => {
      await authService.login('0000012345', '1111');
      const oldAccount = authService.getCurrentUser();

      await authService.changePin('1111', '2222');

      const newAccount = authService.getCurrentUser();
      expect(newAccount?.accountNumber).toBe(oldAccount?.accountNumber);
      expect(newAccount?.pin).not.toBe(oldAccount?.pin);
    });
  });

  describe('COBOL behavior compliance', () => {
    it('should not track failed login attempts', async () => {
      // Make multiple failed attempts
      await authService.login('0000012345', '9999');
      await authService.login('0000012345', '8888');
      await authService.login('0000012345', '7777');

      // Should still be able to login (no lockout)
      const result = await authService.login('0000012345', '1111');
      expect(result.success).toBe(true);
    });

    it('should use simple session management (like VSAM lock)', async () => {
      await authService.login('0000012345', '1111');

      // Session should be in-memory only
      expect(sessionManager.isSessionActive()).toBe(true);
      
      // After logout, session should be cleared
      await authService.logout();
      expect(sessionManager.isSessionActive()).toBe(false);
    });
  });
});
