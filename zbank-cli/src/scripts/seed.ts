#!/usr/bin/env node
/**
 * Seed script to populate test accounts
 * Run with: npm run seed
 */

import { JsonStorage } from '../services/JsonStorage.js';
import { seedTestAccounts, displayAccounts, displayTransactionHistory } from '../utils/migration.js';

async function main() {
  console.log('=== zBANK Data Seeding Script ===\n');

  // Initialize storage
  const storage = new JsonStorage('./data');
  await storage.initialize();

  // Seed test accounts
  await seedTestAccounts(storage);

  // Display all accounts
  await displayAccounts(storage);

  // Display transaction history for each account
  await displayTransactionHistory(storage, '0000012345');
  await displayTransactionHistory(storage, '1234567890');

  console.log('Seeding complete! You can now use these accounts:');
  console.log('  Account: 0000012345, PIN: 1111, Balance: $100.00');
  console.log('  Account: 1234567890, PIN: 1234, Balance: $200.00');
  console.log('\nNote: PINs are hashed in storage for security.');
}

main().catch(error => {
  console.error('Error seeding data:', error);
  process.exit(1);
});
