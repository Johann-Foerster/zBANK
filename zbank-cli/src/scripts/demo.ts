#!/usr/bin/env node
/**
 * Demo script showing storage layer functionality
 * Run with: tsx src/scripts/demo.ts
 */

import { JsonStorage } from '../services/JsonStorage.js';
import { TransactionType, TransactionStatus } from '../models/index.js';
import { comparePin, formatCurrency } from '../utils/validation.js';

async function main() {
	console.log('=== zBANK Storage Demo ===\n');

	const storage = new JsonStorage('./data');
	await storage.initialize();

	// Get an existing account
	console.log('1. Retrieving account 0000012345...');
	const account = await storage.getAccount('0000012345');
	if (account) {
		console.log(`   Account: ${account.accountNumber}`);
		console.log(`   Balance: ${formatCurrency(account.balance)}`);
		console.log(`   Created: ${account.createdAt.toISOString()}\n`);
	}

	// Verify PIN
	console.log('2. Verifying PIN for account...');
	if (account) {
		const isValid = await comparePin('1111', account.pin);
		console.log(`   PIN '1111' is valid: ${isValid}`);
		const isInvalid = await comparePin('9999', account.pin);
		console.log(`   PIN '9999' is valid: ${isInvalid}\n`);
	}

	// Simulate a deposit
	console.log('3. Simulating a deposit of $50.00...');
	if (account) {
		// Lock the account
		const locked = await storage.lockAccount(account.accountNumber);
		console.log(`   Account locked: ${locked}`);

		// Calculate new balance
		const depositAmount = 5000; // $50.00 in cents
		const newBalance = account.balance + depositAmount;

		// Update account balance
		const updated = await storage.updateAccount(account.accountNumber, {
			balance: newBalance,
		});
		console.log(`   New balance: ${formatCurrency(updated.balance)}`);

		// Record transaction
		await storage.addTransaction({
			accountNumber: account.accountNumber,
			type: TransactionType.DEPOSIT,
			amount: depositAmount,
			balanceBefore: account.balance,
			balanceAfter: newBalance,
			status: TransactionStatus.COMPLETED,
			description: 'Demo deposit',
		});
		console.log('   Transaction recorded');

		// Unlock the account
		await storage.unlockAccount(account.accountNumber);
		console.log('   Account unlocked\n');
	}

	// Get transaction history
	console.log('4. Transaction history (last 5 transactions):');
	const history = await storage.getTransactionHistory('0000012345', 5);
	for (const txn of history) {
		console.log(
			`   ${txn.timestamp.toISOString().slice(0, 19)} | ${txn.type.padEnd(10)} | ${formatCurrency(txn.amount).padStart(10)} | Balance: ${formatCurrency(txn.balanceAfter)}`,
		);
		if (txn.description) {
			console.log(`     > ${txn.description}`);
		}
	}

	console.log('\n=== Demo Complete ===');
}

main().catch(error => {
	console.error('Error:', error);
	process.exit(1);
});
