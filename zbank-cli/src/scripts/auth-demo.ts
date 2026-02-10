/**
 * Authentication Demo Script
 * 
 * Demonstrates the authentication system functionality
 */

import { JsonStorage } from '../services/JsonStorage.js';
import { AuthService } from '../services/AuthService.js';
import { SessionManager } from '../services/SessionManager.js';
import { seedTestAccounts } from '../utils/migration.js';

async function main() {
  console.log('=== zBANK Authentication Demo ===\n');

  // Initialize storage
  const storage = new JsonStorage('./data');
  await storage.initialize();

  // Seed test accounts if they don't exist
  const accounts = await storage.listAccounts();
  if (accounts.length === 0) {
    console.log('Seeding test accounts...');
    await seedTestAccounts(storage);
    console.log('');
  }

  // Create authentication service
  const sessionManager = new SessionManager();
  const authService = new AuthService(storage, sessionManager);

  console.log('--- Test 1: Valid Login ---');
  const result1 = await authService.login('0000012345', '1111');
  console.log(`Login result: ${result1.success ? 'SUCCESS' : 'FAILED'}`);
  if (result1.success && result1.account) {
    console.log(`Logged in as: ${result1.account.accountNumber}`);
    console.log(`Balance: $${(result1.account.balance / 100).toFixed(2)}`);
    console.log(`Is authenticated: ${authService.isAuthenticated()}`);
  }
  console.log('');

  console.log('--- Test 2: Check Current User ---');
  const currentUser = authService.getCurrentUser();
  console.log(`Current user: ${currentUser?.accountNumber || 'None'}`);
  console.log('');

  console.log('--- Test 3: Logout ---');
  await authService.logout();
  console.log(`Is authenticated: ${authService.isAuthenticated()}`);
  console.log(`Current user: ${authService.getCurrentUser()?.accountNumber || 'None'}`);
  console.log('');

  console.log('--- Test 4: Invalid PIN (COBOL behavior: no lockout) ---');
  const result2 = await authService.login('0000012345', '9999');
  console.log(`Login result: ${result2.success ? 'SUCCESS' : 'FAILED'}`);
  console.log(`Error: ${result2.error || 'None'}`);
  console.log(`Attempts remaining: Unlimited (matching COBOL)`);
  console.log('');

  console.log('--- Test 5: Multiple Failed Attempts (COBOL behavior) ---');
  for (let i = 1; i <= 5; i++) {
    const result = await authService.login('0000012345', '8888');
    console.log(`Attempt ${i}: ${result.success ? 'SUCCESS' : 'FAILED'}`);
  }
  console.log('Account is NOT locked (matching COBOL behavior)');
  console.log('');

  console.log('--- Test 6: Login Still Works After Failed Attempts ---');
  const result3 = await authService.login('0000012345', '1111');
  console.log(`Login result: ${result3.success ? 'SUCCESS' : 'FAILED'}`);
  console.log('');

  console.log('--- Test 7: Change PIN ---');
  const pinChangeResult = await authService.changePin('1111', '2222');
  console.log(`PIN change result: ${pinChangeResult ? 'SUCCESS' : 'FAILED'}`);
  
  // Verify new PIN works
  await authService.logout();
  const result4 = await authService.login('0000012345', '2222');
  console.log(`Login with new PIN: ${result4.success ? 'SUCCESS' : 'FAILED'}`);
  console.log('');

  console.log('--- Test 8: Account Not Found ---');
  await authService.logout();
  const result5 = await authService.login('9999999999', '1111');
  console.log(`Login result: ${result5.success ? 'SUCCESS' : 'FAILED'}`);
  console.log(`Error: ${result5.error || 'None'}`);
  console.log('');

  console.log('=== Authentication Demo Complete ===');
  console.log('\nKey Features Demonstrated:');
  console.log('✓ PIN hashing with bcrypt');
  console.log('✓ Successful login with valid credentials');
  console.log('✓ Session management (login/logout)');
  console.log('✓ Invalid PIN rejection');
  console.log('✓ No account lockout (matching COBOL behavior)');
  console.log('✓ Unlimited login attempts (matching COBOL behavior)');
  console.log('✓ PIN change functionality');
  console.log('✓ Account not found handling');
}

main().catch(console.error);
