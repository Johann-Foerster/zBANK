import { Account, CreateAccount, UpdateAccount } from '../models/Account';
import { Transaction, CreateTransaction } from '../models/Transaction';

/**
 * Storage interface abstraction for account and transaction operations
 * 
 * This interface provides a contract that can be implemented by different
 * storage backends (JSON files, SQLite, etc.)
 */
export interface IStorage {
  // Account operations
  
  /**
   * Retrieve an account by account number
   * @param accountNumber - The 10-digit account number
   * @returns The account if found, null otherwise
   */
  getAccount(accountNumber: string): Promise<Account | null>;
  
  /**
   * Create a new account
   * @param account - Account data (without timestamps)
   * @returns The created account with timestamps
   */
  createAccount(account: CreateAccount): Promise<Account>;
  
  /**
   * Update an existing account
   * @param accountNumber - The account number to update
   * @param updates - Partial account updates
   * @returns The updated account
   * @throws Error if account not found
   */
  updateAccount(accountNumber: string, updates: UpdateAccount): Promise<Account>;
  
  /**
   * Delete an account
   * @param accountNumber - The account number to delete
   * @returns true if deleted, false if not found
   */
  deleteAccount(accountNumber: string): Promise<boolean>;
  
  /**
   * List all accounts
   * @returns Array of all accounts
   */
  listAccounts(): Promise<Account[]>;
  
  // Transaction operations
  
  /**
   * Add a new transaction
   * @param transaction - Transaction data (without ID and timestamp)
   * @returns The created transaction with ID and timestamp
   */
  addTransaction(transaction: CreateTransaction): Promise<Transaction>;
  
  /**
   * Get transaction history for an account
   * @param accountNumber - The account number
   * @param limit - Optional limit on number of transactions (most recent first)
   * @returns Array of transactions for the account
   */
  getTransactionHistory(accountNumber: string, limit?: number): Promise<Transaction[]>;
  
  // Locking for concurrent access (similar to VSAM UPDATE lock)
  
  /**
   * Lock an account for exclusive access
   * @param accountNumber - The account number to lock
   * @returns true if lock acquired, false if already locked
   */
  lockAccount(accountNumber: string): Promise<boolean>;
  
  /**
   * Unlock an account
   * @param accountNumber - The account number to unlock
   * @returns true if unlocked, false if not locked
   */
  unlockAccount(accountNumber: string): Promise<boolean>;
}
