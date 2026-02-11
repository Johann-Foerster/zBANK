/**
 * Storage Initialization Utility
 *
 * Initializes the JSON storage with seed data if it doesn't already exist.
 * This ensures test accounts are available on first run, matching the COBOL
 * SEQDAT.ZBANK seed data.
 */

import { JsonStorage } from '../services/JsonStorage.js';
import { hashPin } from './crypto.js';

/**
 * Initialize storage with seed data if needed
 * Loads test accounts matching COBOL mainframe test data:
 * - Account: 0000012345, PIN: 1111, Balance: $100.00
 * - Account: 1234567890, PIN: 1234, Balance: $200.00
 */
export async function initializeStorage(): Promise<void> {
	const storage = new JsonStorage();
	await storage.initialize();

	// Check if data already exists
	const accounts = await storage.listAccounts();
	if (accounts.length > 0) {
		return; // Already initialized
	}

	// Load seed data (matching COBOL SEQDAT.ZBANK)
	const seedAccounts = [
		{
			accountNumber: '0000012345',
			pin: await hashPin('1111'),
			balance: 10000, // $100.00 in cents
			isLocked: false,
			failedLoginAttempts: 0,
		},
		{
			accountNumber: '1234567890',
			pin: await hashPin('1234'),
			balance: 20000, // $200.00 in cents
			isLocked: false,
			failedLoginAttempts: 0,
		},
	];

	for (const account of seedAccounts) {
		await storage.createAccount(account);
	}

	console.log('✓ Initialized storage with seed data');
}
