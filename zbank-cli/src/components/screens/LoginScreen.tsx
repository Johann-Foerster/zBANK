/**
 * LoginScreen - User authentication screen
 *
 * Implements login functionality matching COBOL ZLOGIN BMS map:
 * - Account number input (10 digits)
 * - PIN input (4 digits, masked)
 * - Loading state during authentication
 * - Error message display
 * - Keyboard shortcuts (Q=Quit, R=Register)
 */

import React, { useState } from 'react';
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import { Header } from '../common/Header.js';
import { Footer } from '../common/Footer.js';
import { NumericInput } from '../common/NumericInput.js';
import { ErrorMessage } from '../common/ErrorMessage.js';
import { useAuth } from '../../contexts/ServiceContext.js';
import { useKeyboard } from '../../hooks/useKeyboard.js';

interface LoginScreenProps {
	onSuccess: () => void;
	onRegister?: () => void;
	onHelp?: () => void;
}

type FocusedField = 'account' | 'pin';

export const LoginScreen: React.FC<LoginScreenProps> = ({
	onSuccess,
	onRegister,
	onHelp,
}) => {
	const authService = useAuth();

	const [accountNumber, setAccountNumber] = useState('');
	const [pin, setPin] = useState('');
	const [error, setError] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [focusedField, setFocusedField] = useState<FocusedField>('account');

	/**
	 * Handle login submission
	 * Authenticates user with account number and PIN
	 */
	const handleLogin = async () => {
		// Validate inputs
		if (accountNumber.length !== 10) {
			setError('Account number must be 10 digits');
			return;
		}

		if (pin.length !== 4) {
			setError('PIN must be 4 digits');
			return;
		}

		setIsLoading(true);
		setError('');

		try {
			const result = await authService.login(accountNumber, pin);

			if (result.success && result.account) {
				// Success - navigate to home screen
				onSuccess();
			} else {
				// Failed - show error and clear PIN
				setError(result.error || 'Login failed');
				setPin('');
				setFocusedField('pin');
			}
		} catch (err) {
			setError(
				err instanceof Error ? err.message : 'An unexpected error occurred',
			);
			setPin('');
			setFocusedField('pin');
		} finally {
			setIsLoading(false);
		}
	};

	/**
	 * Handle account number field submission (Enter key)
	 * Moves focus to PIN field
	 */
	const handleAccountSubmit = () => {
		if (accountNumber.length === 10) {
			setFocusedField('pin');
			setError('');
		} else {
			setError('Account number must be 10 digits');
		}
	};

	/**
	 * Handle PIN field submission (Enter key)
	 * Submits login form
	 */
	const handlePinSubmit = () => {
		if (pin.length === 4) {
			handleLogin();
		} else {
			setError('PIN must be 4 digits');
		}
	};

	/**
	 * Handle quit/exit keyboard shortcut
	 */
	const handleExit = () => {
		// In the original COBOL app, pressing Q exits the application
		// Here we just clear the form since there's no EXIT screen handler in props
		setAccountNumber('');
		setPin('');
		setError('');
		setFocusedField('account');
	};

	/**
	 * Handle register keyboard shortcut
	 */
	const handleRegister = () => {
		if (onRegister) {
			onRegister();
		}
	};

	/**
	 * Handle help keyboard shortcut
	 */
	const handleHelp = () => {
		if (onHelp) {
			onHelp();
		}
	};

	// Register keyboard shortcuts
	useKeyboard({
		Q: handleExit,
		R: handleRegister,
		H: handleHelp,
		ESCAPE: handleExit,
	});

	return (
		<Box flexDirection="column">
			<Header title="LOGIN" showLogo={true} />

			<Box flexDirection="column" paddingX={2} paddingTop={1}>
				{/* Account Number Input */}
				<Box flexDirection="column" marginBottom={1}>
					<Text color="cyan">Account Number (10 digits):</Text>
					<NumericInput
						value={accountNumber}
						onChange={setAccountNumber}
						onSubmit={handleAccountSubmit}
						maxLength={10}
						placeholder="0000000000"
						focus={focusedField === 'account' && !isLoading}
					/>
				</Box>

				{/* PIN Input */}
				<Box flexDirection="column" marginBottom={1}>
					<Text color="cyan">PIN (4 digits):</Text>
					<NumericInput
						value={pin}
						onChange={setPin}
						onSubmit={handlePinSubmit}
						maxLength={4}
						mask="*"
						placeholder="****"
						focus={focusedField === 'pin' && !isLoading}
					/>
				</Box>

				{/* Error Message */}
				{error && (
					<Box marginTop={1}>
						<ErrorMessage message={error} />
					</Box>
				)}

				{/* Loading Indicator */}
				{isLoading && (
					<Box marginTop={1}>
						<Text color="yellow">
							<Spinner type="dots" />
						</Text>
						<Text color="yellow"> Authenticating...</Text>
					</Box>
				)}

				{/* Instructions */}
				{!isLoading && !error && (
					<Box marginTop={1}>
						<Text dimColor>Press Enter to login, Tab to switch fields</Text>
					</Box>
				)}
			</Box>

			<Footer hints={['[Q] Quit', '[R] Register', '[H] Help', '[↵] Login']} />
		</Box>
	);
};
