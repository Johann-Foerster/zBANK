import { promises as fs } from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { IStorage } from './IStorage';
import {
  Account,
  CreateAccount,
  UpdateAccount,
  AccountSchema,
} from '../models/Account';
import {
  Transaction,
  CreateTransaction,
  TransactionSchema,
} from '../models/Transaction';

/**
 * JSON-based storage implementation with file locking
 * 
 * Stores data in JSON files with atomic write operations
 * Implements simple in-memory locking for concurrent access
 */
export class JsonStorage implements IStorage {
  private accountsFile: string;
  private transactionsFile: string;
  private locks: Set<string> = new Set();
  
  // In-memory caches
  private accountsCache: Map<string, Account> | null = null;
  private transactionsCache: Transaction[] | null = null;

  /**
   * Create a new JSON storage instance
   * @param dataDir - Directory to store JSON files (defaults to ./data)
   */
  constructor(dataDir: string = './data') {
    this.accountsFile = path.join(dataDir, 'accounts.json');
    this.transactionsFile = path.join(dataDir, 'transactions.json');
  }

  /**
   * Initialize storage by ensuring data directory and files exist
   */
  async initialize(): Promise<void> {
    const dataDir = path.dirname(this.accountsFile);
    
    // Create data directory if it doesn't exist
    try {
      await fs.mkdir(dataDir, { recursive: true });
    } catch {
      // Directory might already exist, that's ok
    }

    // Initialize accounts file if it doesn't exist
    try {
      await fs.access(this.accountsFile);
    } catch {
      await this.saveAccounts({});
    }

    // Initialize transactions file if it doesn't exist
    try {
      await fs.access(this.transactionsFile);
    } catch {
      await this.saveTransactions([]);
    }
  }

  /**
   * Load accounts from JSON file
   */
  private async loadAccounts(): Promise<Map<string, Account>> {
    if (this.accountsCache) {
      return this.accountsCache;
    }

    try {
      const data = await fs.readFile(this.accountsFile, 'utf-8');
      const accountsObj = JSON.parse(data, (key, value) => {
        // Convert ISO date strings back to Date objects
        if (key === 'createdAt' || key === 'updatedAt') {
          return new Date(value);
        }
        return value;
      });

      const accounts = new Map<string, Account>();
      for (const [accountNumber, account] of Object.entries(accountsObj)) {
        // Validate account data
        const validated = AccountSchema.parse(account);
        accounts.set(accountNumber, validated);
      }

      this.accountsCache = accounts;
      return accounts;
    } catch (error) {
      throw new Error(`Failed to load accounts: ${error instanceof Error ? error.message : String(error)}`, {
        cause: error,
      });
    }
  }

  /**
   * Save accounts to JSON file atomically
   */
  private async saveAccounts(accounts: Record<string, Account> | Map<string, Account>): Promise<void> {
    const accountsObj: Record<string, Account> = {};
    
    if (accounts instanceof Map) {
      for (const [key, value] of accounts.entries()) {
        accountsObj[key] = value;
      }
    } else {
      Object.assign(accountsObj, accounts);
    }

    const tempFile = `${this.accountsFile}.tmp`;
    
    try {
      // Write to temporary file first
      await fs.writeFile(tempFile, JSON.stringify(accountsObj, null, 2), 'utf-8');
      
      // Atomic rename
      await fs.rename(tempFile, this.accountsFile);
      
      // Invalidate cache
      this.accountsCache = null;
    } catch (error) {
      // Clean up temp file if it exists
      try {
        await fs.unlink(tempFile);
      } catch {
        // Ignore cleanup errors
      }
      throw new Error(`Failed to save accounts: ${error instanceof Error ? error.message : String(error)}`, {
        cause: error,
      });
    }
  }

  /**
   * Load transactions from JSON file
   */
  private async loadTransactions(): Promise<Transaction[]> {
    if (this.transactionsCache) {
      return this.transactionsCache;
    }

    try {
      const data = await fs.readFile(this.transactionsFile, 'utf-8');
      const transactionsArray = JSON.parse(data, (key, value) => {
        // Convert ISO date strings back to Date objects
        if (key === 'timestamp') {
          return new Date(value);
        }
        return value;
      });

      const transactions: Transaction[] = [];
      for (const transaction of transactionsArray) {
        // Validate transaction data
        const validated = TransactionSchema.parse(transaction);
        transactions.push(validated);
      }

      this.transactionsCache = transactions;
      return transactions;
    } catch (error) {
      throw new Error(`Failed to load transactions: ${error instanceof Error ? error.message : String(error)}`, {
        cause: error,
      });
    }
  }

  /**
   * Save transactions to JSON file atomically
   */
  private async saveTransactions(transactions: Transaction[]): Promise<void> {
    const tempFile = `${this.transactionsFile}.tmp`;
    
    try {
      // Write to temporary file first
      await fs.writeFile(tempFile, JSON.stringify(transactions, null, 2), 'utf-8');
      
      // Atomic rename
      await fs.rename(tempFile, this.transactionsFile);
      
      // Invalidate cache
      this.transactionsCache = null;
    } catch (error) {
      // Clean up temp file if it exists
      try {
        await fs.unlink(tempFile);
      } catch {
        // Ignore cleanup errors
      }
      throw new Error(`Failed to save transactions: ${error instanceof Error ? error.message : String(error)}`, {
        cause: error,
      });
    }
  }

  // IStorage implementation

  async getAccount(accountNumber: string): Promise<Account | null> {
    const accounts = await this.loadAccounts();
    return accounts.get(accountNumber) || null;
  }

  async createAccount(account: CreateAccount): Promise<Account> {
    const accounts = await this.loadAccounts();
    
    // Check if account already exists
    if (accounts.has(account.accountNumber)) {
      throw new Error(`Account ${account.accountNumber} already exists`);
    }

    // Create account with timestamps
    const now = new Date();
    const newAccount: Account = {
      ...account,
      createdAt: now,
      updatedAt: now,
    };

    // Validate
    AccountSchema.parse(newAccount);

    // Add to storage
    accounts.set(account.accountNumber, newAccount);
    await this.saveAccounts(accounts);

    return newAccount;
  }

  async updateAccount(accountNumber: string, updates: UpdateAccount): Promise<Account> {
    const accounts = await this.loadAccounts();
    
    const existingAccount = accounts.get(accountNumber);
    if (!existingAccount) {
      throw new Error(`Account ${accountNumber} not found`);
    }

    // Apply updates
    const updatedAccount: Account = {
      ...existingAccount,
      ...updates,
      accountNumber, // Ensure account number doesn't change
      updatedAt: new Date(),
    };

    // Validate
    AccountSchema.parse(updatedAccount);

    // Save to storage
    accounts.set(accountNumber, updatedAccount);
    await this.saveAccounts(accounts);

    return updatedAccount;
  }

  async deleteAccount(accountNumber: string): Promise<boolean> {
    const accounts = await this.loadAccounts();
    
    if (!accounts.has(accountNumber)) {
      return false;
    }

    accounts.delete(accountNumber);
    await this.saveAccounts(accounts);

    return true;
  }

  async listAccounts(): Promise<Account[]> {
    const accounts = await this.loadAccounts();
    return Array.from(accounts.values());
  }

  async addTransaction(transaction: CreateTransaction): Promise<Transaction> {
    const transactions = await this.loadTransactions();

    // Create transaction with ID and timestamp
    const newTransaction: Transaction = {
      ...transaction,
      id: uuidv4(),
      timestamp: new Date(),
    };

    // Validate
    TransactionSchema.parse(newTransaction);

    // Add to storage
    transactions.push(newTransaction);
    await this.saveTransactions(transactions);

    return newTransaction;
  }

  async getTransactionHistory(accountNumber: string, limit?: number): Promise<Transaction[]> {
    const transactions = await this.loadTransactions();
    
    // Filter by account number and sort by timestamp (most recent first)
    const accountTransactions = transactions
      .filter(t => t.accountNumber === accountNumber)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Apply limit if specified
    if (limit !== undefined && limit > 0) {
      return accountTransactions.slice(0, limit);
    }

    return accountTransactions;
  }

  async lockAccount(accountNumber: string): Promise<boolean> {
    if (this.locks.has(accountNumber)) {
      return false; // Already locked
    }

    this.locks.add(accountNumber);
    return true;
  }

  async unlockAccount(accountNumber: string): Promise<boolean> {
    if (!this.locks.has(accountNumber)) {
      return false; // Not locked
    }

    this.locks.delete(accountNumber);
    return true;
  }
}
