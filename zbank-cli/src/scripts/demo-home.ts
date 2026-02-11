/**
 * Demo script to showcase HomeScreen UI without user interaction
 * Generates sample output showing the different states
 */

import { formatBalance } from '../utils/formatter.js';

console.log('\n════════════════════════════════════════════════════════════');
console.log('  zBANK CLI - HomeScreen Demo');
console.log('════════════════════════════════════════════════════════════\n');

console.log('STATE 1: Initial Home Screen (Action Menu)');
console.log('─────────────────────────────────────────────────────────────');
console.log(`
  ╔══════════════╗
  ║    zBANK     ║
  ╚══════════════╝

  HOME
  ────────────────────────────────────────────────────────

  Welcome, Account: 0000012345
  Current Balance:
  $100.00

  Select an action:
  > Deposit
    Withdraw
    Logout

  ────────────────────────────────────────────────────────
  [↑↓] Navigate  [↵] Select  [Q] Logout
`);

console.log('\nSTATE 2: Deposit Transaction Input');
console.log('─────────────────────────────────────────────────────────────');
console.log(`
  ╔══════════════╗
  ║    zBANK     ║
  ╚══════════════╝

  HOME
  ────────────────────────────────────────────────────────

  Welcome, Account: 0000012345
  Current Balance:
  $100.00

  Deposit
  Enter amount:
  $ 50.00█

  Press Enter to confirm, ESC to cancel

  ────────────────────────────────────────────────────────
  [ESC] Cancel  [Q] Logout
`);

console.log('\nSTATE 3: Processing Transaction');
console.log('─────────────────────────────────────────────────────────────');
console.log(`
  ╔══════════════╗
  ║    zBANK     ║
  ╚══════════════╝

  HOME
  ────────────────────────────────────────────────────────

  Welcome, Account: 0000012345
  Current Balance:
  $100.00

  Deposit
  Enter amount:
  $ 50.00

  Press Enter to confirm, ESC to cancel

  ⠋ Processing transaction...

  ────────────────────────────────────────────────────────
  [ESC] Cancel  [Q] Logout
`);

console.log('\nSTATE 4: Transaction Success');
console.log('─────────────────────────────────────────────────────────────');
console.log(`
  ╔══════════════╗
  ║    zBANK     ║
  ╚══════════════╝

  HOME
  ────────────────────────────────────────────────────────

  Welcome, Account: 0000012345
  Current Balance:
  $150.00

  Select an action:
  > Deposit
    Withdraw
    Logout

  ✓ Transaction successful! New balance: $150.00

  ────────────────────────────────────────────────────────
  [↑↓] Navigate  [↵] Select  [Q] Logout
`);

console.log('\nSTATE 5: Withdraw Transaction (Overdraft)');
console.log('─────────────────────────────────────────────────────────────');
console.log(`
  ╔══════════════╗
  ║    zBANK     ║
  ╚══════════════╝

  HOME
  ────────────────────────────────────────────────────────

  Welcome, Account: 0000012345
  Current Balance:
  -$50.00

  Select an action:
  > Deposit
    Withdraw
    Logout

  ✓ Transaction successful! New balance: -$50.00

  ────────────────────────────────────────────────────────
  [↑↓] Navigate  [↵] Select  [Q] Logout
`);

console.log('\n════════════════════════════════════════════════════════════');
console.log('  Key Features Demonstrated:');
console.log('════════════════════════════════════════════════════════════');
console.log('  ✓ Interactive action menu with arrow key navigation');
console.log('  ✓ Real-time balance display (green for positive, red for negative)');
console.log('  ✓ Currency input with $ prefix and XX.XX validation');
console.log('  ✓ Loading spinner during transaction processing');
console.log('  ✓ Success messages with checkmark (✓) in green');
console.log('  ✓ Balance updates immediately after transaction');
console.log('  ✓ Keyboard shortcuts: ESC to cancel, Q to logout');
console.log('  ✓ Overdraft allowed (matching COBOL behavior)');
console.log('════════════════════════════════════════════════════════════\n');

console.log('Transaction Examples:');
console.log('─────────────────────────────────────────────────────────────');
console.log(`Initial Balance:  ${formatBalance(10000)}`);
console.log(`Deposit $50.00:   ${formatBalance(15000)}`);
console.log(`Withdraw $20.00:  ${formatBalance(13000)}`);
console.log(`Withdraw $200.00: ${formatBalance(-7000)} (overdraft)`);
console.log('═════════════════════════════════════════════════════════════\n');
