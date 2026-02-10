import { JsonStorage } from '../services/JsonStorage';
import { hashPin, dollarsToCents } from './validation';
import { TransactionStatus, TransactionType } from '../models/Transaction';

/**
 * Migration utilities for converting COBOL data to JSON format
 */

/**
 * Seed initial test accounts from COBOL SEQDAT.ZBANK
 * 
 * Original COBOL test data:
 * - Account: 0000012345, PIN: 0000001111 (user enters 1111), Balance: $100
 * - Account: 1234567890, PIN: 0000001234 (user enters 1234), Balance: $200
 */
export async function seedTestAccounts(storage: JsonStorage): Promise<void> {
  await storage.initialize();

  // Define test accounts
  const testAccounts = [
    {
      accountNumber: '0000012345',
      pin: '1111', // Will be hashed
      balanceDollars: 100,
    },
    {
      accountNumber: '1234567890',
      pin: '1234', // Will be hashed
      balanceDollars: 200,
    },
  ];

  console.log('Seeding test accounts...');

  for (const testAccount of testAccounts) {
    try {
      // Check if account already exists
      const existing = await storage.getAccount(testAccount.accountNumber);
      if (existing) {
        console.log(`  Account ${testAccount.accountNumber} already exists, skipping.`);
        continue;
      }

      // Hash the PIN
      const hashedPin = await hashPin(testAccount.pin);

      // Create account
      const account = await storage.createAccount({
        accountNumber: testAccount.accountNumber,
        pin: hashedPin,
        balance: dollarsToCents(testAccount.balanceDollars),
      });

      console.log(`  Created account ${account.accountNumber} with balance ${testAccount.balanceDollars}`);

      // Add initial transaction for account creation
      await storage.addTransaction({
        accountNumber: account.accountNumber,
        type: TransactionType.DEPOSIT,
        amount: dollarsToCents(testAccount.balanceDollars),
        balanceBefore: 0,
        balanceAfter: dollarsToCents(testAccount.balanceDollars),
        status: TransactionStatus.COMPLETED,
        description: 'Initial deposit - Account creation',
      });
    } catch (error) {
      console.error(`  Failed to create account ${testAccount.accountNumber}:`, error);
    }
  }

  console.log('Seeding complete!');
}

/**
 * Display all accounts (for testing/verification)
 */
export async function displayAccounts(storage: JsonStorage): Promise<void> {
  const accounts = await storage.listAccounts();
  
  console.log('\n=== All Accounts ===');
  for (const account of accounts) {
    const balanceDollars = account.balance / 100;
    console.log(`Account: ${account.accountNumber}, Balance: $${balanceDollars.toFixed(2)}`);
  }
  console.log(`Total accounts: ${accounts.length}\n`);
}

/**
 * Display transaction history for an account (for testing/verification)
 */
export async function displayTransactionHistory(
  storage: JsonStorage,
  accountNumber: string,
  limit?: number
): Promise<void> {
  const transactions = await storage.getTransactionHistory(accountNumber, limit);
  
  console.log(`\n=== Transaction History for ${accountNumber} ===`);
  for (const txn of transactions) {
    const amountDollars = txn.amount / 100;
    const balanceAfterDollars = txn.balanceAfter / 100;
    console.log(
      `${txn.timestamp.toISOString()} | ${txn.type.padEnd(10)} | $${amountDollars.toFixed(2).padStart(8)} | Balance: $${balanceAfterDollars.toFixed(2)} | ${txn.status}`
    );
    if (txn.description) {
      console.log(`  Description: ${txn.description}`);
    }
  }
  console.log(`Total transactions: ${transactions.length}\n`);
}
