/**
 * HomeScreen - Home/transaction screen
 * 
 * Implements transaction functionality matching COBOL ZHOME BMS map:
 * - Balance display
 * - Action menu (Deposit, Withdraw, Logout)
 * - Amount input for transactions
 * - Transaction processing with loading states
 * - Success/error messages
 * - ESC to cancel actions
 */

import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import Spinner from 'ink-spinner';
import { Header } from '../common/Header.js';
import { Footer } from '../common/Footer.js';
import { BalanceDisplay } from '../common/BalanceDisplay.js';
import { CurrencyInput } from '../common/CurrencyInput.js';
import { useTransactions, useSession } from '../../contexts/ServiceContext.js';
import { useKeyboard } from '../../hooks/useKeyboard.js';
import { parseCurrency, formatBalance } from '../../utils/formatter.js';
import { Account } from '../../models/Account.js';

interface HomeScreenProps {
  onLogout: () => void;
}

type TransactionAction = 'deposit' | 'withdraw' | 'logout';
type MessageType = 'success' | 'error' | 'info';

export const HomeScreen: React.FC<HomeScreenProps> = ({ onLogout }) => {
  const transactionService = useTransactions();
  const sessionManager = useSession();
  
  // Get current account from session
  const [account, setAccount] = useState<Account | null>(sessionManager.getSession());
  const [amount, setAmount] = useState('');
  const [selectedAction, setSelectedAction] = useState<TransactionAction | null>(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<MessageType>('info');
  const [isProcessing, setIsProcessing] = useState(false);

  // Refresh account balance from storage
  useEffect(() => {
    const refreshAccount = async () => {
      const currentAccount = sessionManager.getSession();
      if (currentAccount) {
        setAccount(currentAccount);
      }
    };
    refreshAccount();
  }, [sessionManager]);

  const actions = [
    { label: 'Deposit', value: 'deposit' as TransactionAction },
    { label: 'Withdraw', value: 'withdraw' as TransactionAction },
    { label: 'Logout', value: 'logout' as TransactionAction },
  ];

  const handleActionSelect = (item: { value: TransactionAction }) => {
    if (item.value === 'logout') {
      sessionManager.clearSession();
      onLogout();
      return;
    }
    
    setSelectedAction(item.value);
    setMessage('');
    setAmount('');
  };

  const handleTransactionSubmit = async () => {
    if (!amount || !selectedAction || !account) return;
    
    setIsProcessing(true);
    setMessage('');
    
    // Parse amount in cents
    const amountInCents = parseCurrency(amount);
    
    if (amountInCents === null || amountInCents <= 0) {
      setMessageType('error');
      setMessage('Please enter a valid amount');
      setIsProcessing(false);
      return;
    }

    try {
      let result;
      
      switch (selectedAction) {
        case 'deposit':
          result = await transactionService.deposit(account.accountNumber, amountInCents);
          break;
        case 'withdraw':
          result = await transactionService.withdraw(account.accountNumber, amountInCents);
          break;
        default:
          return;
      }
      
      if (result.success && result.newBalance !== undefined) {
        // Update local account balance
        const updatedAccount = { ...account, balance: result.newBalance };
        setAccount(updatedAccount);
        sessionManager.updateSession(updatedAccount);
        
        setMessageType('success');
        setMessage(`Transaction successful! New balance: ${formatBalance(result.newBalance)}`);
        setAmount('');
        setSelectedAction(null);
      } else {
        setMessageType('error');
        setMessage(result.error || 'Transaction failed');
      }
    } catch {
      setMessageType('error');
      setMessage('An error occurred during transaction');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    if (selectedAction) {
      setSelectedAction(null);
      setAmount('');
      setMessage('');
    }
  };

  const handleLogout = () => {
    sessionManager.clearSession();
    onLogout();
  };

  // Register keyboard shortcuts
  useKeyboard({
    Q: handleLogout,
    ESCAPE: handleCancel,
  });

  if (!account) {
    return (
      <Box flexDirection="column">
        <Header title="HOME" />
        <Box padding={2}>
          <Text color="red">No active session. Please log in.</Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Header title="HOME" showLogo={false} />

      <Box flexDirection="column" paddingX={2}>
        {/* Account Info */}
        <Box flexDirection="column" marginBottom={1}>
          <Text>Welcome, Account: <Text color="cyan">{account.accountNumber}</Text></Text>
          <BalanceDisplay balance={account.balance} />
        </Box>

        {/* Action Menu or Transaction Input */}
        {!selectedAction ? (
          <Box flexDirection="column" marginTop={1}>
            <Text dimColor>Select an action:</Text>
            <Box marginTop={1}>
              <SelectInput items={actions} onSelect={handleActionSelect} />
            </Box>
          </Box>
        ) : (
          <Box flexDirection="column" marginTop={1}>
            <Text bold color="cyan">
              {selectedAction.charAt(0).toUpperCase() + selectedAction.slice(1)}
            </Text>
            
            <Box marginTop={1} flexDirection="column">
              <Text>Enter amount:</Text>
              <CurrencyInput
                value={amount}
                onChange={setAmount}
                onSubmit={handleTransactionSubmit}
                focus={!isProcessing}
              />
            </Box>
            
            <Box marginTop={1}>
              <Text dimColor>Press Enter to confirm, ESC to cancel</Text>
            </Box>
          </Box>
        )}

        {/* Message Display */}
        {message && (
          <Box marginTop={1}>
            <Text color={messageType === 'success' ? 'green' : messageType === 'error' ? 'red' : 'white'}>
              {messageType === 'success' && '✓ '}
              {messageType === 'error' && '✗ '}
              {message}
            </Text>
          </Box>
        )}

        {/* Loading Indicator */}
        {isProcessing && (
          <Box marginTop={1}>
            <Text color="yellow">
              <Spinner type="dots" />
            </Text>
            <Text color="yellow"> Processing transaction...</Text>
          </Box>
        )}
      </Box>

      <Footer hints={selectedAction ? ['[ESC] Cancel', '[Q] Logout'] : ['[↑↓] Navigate', '[↵] Select', '[Q] Logout']} />
    </Box>
  );
};
