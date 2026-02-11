/**
 * Test script for HomeScreen functionality
 * This manually tests the deposit and withdraw flows
 */

import { JsonStorage } from '../services/JsonStorage.js';
import { TransactionService } from '../services/TransactionService.js';
import { formatBalance } from '../utils/formatter.js';

async function testHomeScreenFunctionality() {
	console.log('=== Testing HomeScreen Transaction Functionality ===\n');

	const storage = new JsonStorage('./data');
	await storage.initialize();

	const transactionService = new TransactionService(storage);
	const testAccount = '0000012345';

	// Get initial balance
	const initialBalance = await transactionService.getBalance(testAccount);
	console.log(
		`Initial balance for ${testAccount}: ${formatBalance(initialBalance)}`,
	);

	// Test deposit
	console.log('\n--- Testing Deposit ---');
	const depositAmount = 5000; // $50.00
	const depositResult = await transactionService.deposit(
		testAccount,
		depositAmount,
	);

	if (depositResult.success) {
		console.log(`✓ Deposit successful: ${formatBalance(depositAmount)}`);
		console.log(`  New balance: ${formatBalance(depositResult.newBalance!)}`);
	} else {
		console.log(`✗ Deposit failed: ${depositResult.error}`);
	}

	// Test withdraw
	console.log('\n--- Testing Withdraw ---');
	const withdrawAmount = 2000; // $20.00
	const withdrawResult = await transactionService.withdraw(
		testAccount,
		withdrawAmount,
	);

	if (withdrawResult.success) {
		console.log(`✓ Withdraw successful: ${formatBalance(withdrawAmount)}`);
		console.log(`  New balance: ${formatBalance(withdrawResult.newBalance!)}`);
	} else {
		console.log(`✗ Withdraw failed: ${withdrawResult.error}`);
	}

	// Test withdraw that causes negative balance (should succeed per COBOL behavior)
	console.log('\n--- Testing Overdraft (COBOL behavior) ---');
	const overdraftAmount = 20000; // $200.00 (more than balance)
	const overdraftResult = await transactionService.withdraw(
		testAccount,
		overdraftAmount,
	);

	if (overdraftResult.success) {
		console.log(
			`✓ Overdraft withdraw successful: ${formatBalance(overdraftAmount)}`,
		);
		console.log(`  New balance: ${formatBalance(overdraftResult.newBalance!)}`);
		console.log(`  (Negative balance allowed, matching COBOL behavior)`);
	} else {
		console.log(`✗ Overdraft failed: ${overdraftResult.error}`);
	}

	// Get final balance
	const finalBalance = await transactionService.getBalance(testAccount);
	console.log(
		`\nFinal balance for ${testAccount}: ${formatBalance(finalBalance)}`,
	);

	console.log('\n=== Test Complete ===');
}

testHomeScreenFunctionality().catch(console.error);
