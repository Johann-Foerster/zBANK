#!/bin/bash

# Manual test script for zBANK CLI HomeScreen
# Tests the complete flow: login -> deposit -> withdraw -> logout

echo "=== zBANK CLI Manual Test ==="
echo ""
echo "This script will test the complete HomeScreen functionality"
echo ""
echo "Test Account:"
echo "  Account Number: 0000012345"
echo "  PIN: 1111"
echo "  Initial Balance: \$100.00"
echo ""
echo "Steps to perform:"
echo "  1. Login with the test account"
echo "  2. Select 'Deposit' from the menu"
echo "  3. Enter amount: 50.00"
echo "  4. Verify balance is now \$150.00"
echo "  5. Select 'Withdraw' from the menu"
echo "  6. Enter amount: 25.50"
echo "  7. Verify balance is now \$124.50"
echo "  8. Test ESC key to cancel an action"
echo "  9. Select 'Logout' to exit"
echo ""
echo "Expected Results:"
echo "  ✓ Balance displayed correctly with color"
echo "  ✓ Action menu shows Deposit/Withdraw/Logout"
echo "  ✓ Currency input accepts XX.XX format"
echo "  ✓ Loading spinner shows during processing"
echo "  ✓ Success messages appear in green"
echo "  ✓ Balance updates immediately after transaction"
echo "  ✓ ESC cancels current action"
echo "  ✓ Q or Logout returns to login screen"
echo ""
echo "Press Enter to start the CLI application..."
read

cd "$(dirname "$0")/.." && npm start
