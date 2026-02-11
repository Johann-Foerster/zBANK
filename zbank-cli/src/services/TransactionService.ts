import { IStorage } from './IStorage.js';
import { Transaction, TransactionType, TransactionStatus } from '../models/Transaction.js';

/**
 * Result of a transaction operation
 */
export interface TransactionResult {
  success: boolean;
  transaction?: Transaction;
  newBalance?: number;
  error?: string;
}

/**
 * Result of amount validation
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Transaction service interface
 */
export interface ITransactionService {
  deposit(accountNumber: string, amount: number): Promise<TransactionResult>;
  withdraw(accountNumber: string, amount: number): Promise<TransactionResult>;
  transfer(fromAccount: string, toAccount: string, amount: number): Promise<TransactionResult>;
  getBalance(accountNumber: string): Promise<number>;
  validateAmount(amount: number): ValidationResult;
}

/**
 * TransactionService - Core banking transaction logic
 * 
 * Implements deposit and withdrawal operations matching COBOL behavior:
 * - Allows negative balances (no overdraft protection)
 * - Records transaction history
 * - Validates amounts
 * 
 * Transfer functionality remains a placeholder (matching COBOL)
 */
export class TransactionService implements ITransactionService {
  constructor(private storage: IStorage) {}

  /**
   * Deposit funds into an account
   * @param accountNumber - The account number
   * @param amount - The amount in cents
   * @returns TransactionResult with success status and new balance
   */
  async deposit(accountNumber: string, amount: number): Promise<TransactionResult> {
    // Validate amount
    const validation = this.validateAmount(amount);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Get current account
    const account = await this.storage.getAccount(accountNumber);
    if (!account) {
      return { success: false, error: 'Account not found' };
    }

    // Calculate new balance
    const newBalance = account.balance + amount;

    // Create transaction record
    const transaction = await this.storage.addTransaction({
      accountNumber,
      type: TransactionType.DEPOSIT,
      amount,
      balanceBefore: account.balance,
      balanceAfter: newBalance,
      status: TransactionStatus.COMPLETED,
    });

    // Update account
    await this.storage.updateAccount(accountNumber, {
      balance: newBalance,
      updatedAt: new Date(),
    });

    return { success: true, transaction, newBalance };
  }

  /**
   * Withdraw funds from an account
   * 
   * IMPORTANT: COBOL allows negative balances, so we do NOT check sufficient funds
   * This matches the original COBOL behavior (see docs/overview.md line 386)
   * 
   * @param accountNumber - The account number
   * @param amount - The amount in cents
   * @returns TransactionResult with success status and new balance
   */
  async withdraw(accountNumber: string, amount: number): Promise<TransactionResult> {
    // Validate amount
    const validation = this.validateAmount(amount);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Get current account
    const account = await this.storage.getAccount(accountNumber);
    if (!account) {
      return { success: false, error: 'Account not found' };
    }

    // Calculate new balance (may go negative like COBOL)
    const newBalance = account.balance - amount;

    // Create transaction record
    const transaction = await this.storage.addTransaction({
      accountNumber,
      type: TransactionType.WITHDRAWAL,
      amount,
      balanceBefore: account.balance,
      balanceAfter: newBalance,
      status: TransactionStatus.COMPLETED,
    });

    // Update account
    await this.storage.updateAccount(accountNumber, {
      balance: newBalance,
      updatedAt: new Date(),
    });

    return { success: true, transaction, newBalance };
  }

  /**
   * Transfer funds between accounts
   * 
   * Transfer not implemented in COBOL - return placeholder
   * This matches the original COBOL behavior where transfer is not implemented
   * 
   * @param _fromAccount - Source account number
   * @param _toAccount - Destination account number
   * @param _amount - The amount in cents
   * @returns TransactionResult with error indicating not implemented
   */
  async transfer(
    _fromAccount: string,
    _toAccount: string,
    _amount: number
  ): Promise<TransactionResult> {
    return {
      success: false,
      error: 'Transfer functionality not implemented (matching COBOL behavior)',
    };
  }

  /**
   * Get the current balance of an account
   * @param accountNumber - The account number
   * @returns The current balance in cents
   * @throws Error if account not found
   */
  async getBalance(accountNumber: string): Promise<number> {
    const account = await this.storage.getAccount(accountNumber);
    if (!account) {
      throw new Error('Account not found');
    }
    return account.balance;
  }

  /**
   * Validate transaction amount
   * @param amount - The amount in cents
   * @returns ValidationResult with valid status and optional error message
   */
  validateAmount(amount: number): ValidationResult {
    if (amount <= 0) {
      return { valid: false, error: 'Amount must be greater than zero' };
    }
    if (!Number.isInteger(amount)) {
      return { valid: false, error: 'Amount must be in cents (whole number)' };
    }
    if (amount > 1000000000) {
      // $10 million limit
      return { valid: false, error: 'Amount exceeds maximum limit' };
    }
    return { valid: true };
  }
}
