import { Transaction, TransactionType } from '../models/Transaction.js';

/**
 * Formatter utilities for zBANK CLI
 * Provides consistent formatting for transactions, balances, and timestamps
 */

/**
 * Format a transaction as a human-readable string
 * @param transaction - The transaction to format
 * @returns Formatted transaction string
 */
export function formatTransaction(transaction: Transaction): string {
  const type = formatTransactionType(transaction.type);
  const amount = formatBalance(transaction.amount);
  const timestamp = formatTimestamp(transaction.timestamp);
  const balance = formatBalance(transaction.balanceAfter);

  return `${timestamp} | ${type} | ${amount} | Balance: ${balance}`;
}

/**
 * Format a transaction type for display
 * @param type - The transaction type
 * @returns Formatted type string
 */
function formatTransactionType(type: TransactionType): string {
  switch (type) {
    case TransactionType.DEPOSIT:
      return 'DEPOSIT   ';
    case TransactionType.WITHDRAWAL:
      return 'WITHDRAWAL';
    case TransactionType.TRANSFER:
      return 'TRANSFER  ';
    default:
      return 'UNKNOWN   ';
  }
}

/**
 * Format balance/amount as currency string
 * @param balance - The balance in cents
 * @returns Formatted currency string (e.g., "$100.00")
 */
export function formatBalance(balance: number): string {
  const dollars = balance / 100;
  const formatted = Math.abs(dollars).toFixed(2);
  return dollars < 0 ? `-$${formatted}` : `$${formatted}`;
}

/**
 * Format a timestamp for display
 * @param date - The date to format
 * @returns Formatted timestamp string (e.g., "2024-01-15 14:30:45")
 */
export function formatTimestamp(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * Parse a currency string to cents
 * Handles inputs like "$100.00", "100", "$100"
 * @param input - The currency string to parse
 * @returns Amount in cents, or null if invalid
 */
export function parseCurrency(input: string): number | null {
  // Remove whitespace and dollar sign
  const cleaned = input.trim().replace(/^\$/, '');

  // Parse as number
  const value = parseFloat(cleaned);

  // Check if valid
  if (isNaN(value) || value < 0) {
    return null;
  }

  // Convert to cents and round
  return Math.round(value * 100);
}

/**
 * Format an account number for display (with optional masking)
 * @param accountNumber - The 10-digit account number
 * @param mask - Whether to mask the account number (show only last 4 digits)
 * @returns Formatted account number
 */
export function formatAccountNumber(accountNumber: string, mask: boolean = false): string {
  if (mask && accountNumber.length === 10) {
    return `******${accountNumber.slice(-4)}`;
  }
  return accountNumber;
}
