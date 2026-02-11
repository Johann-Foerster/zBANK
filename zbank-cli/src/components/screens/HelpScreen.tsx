import React from 'react';
import { Box, Text } from 'ink';
import { Header } from '../common/Header.js';
import { Footer } from '../common/Footer.js';
import { useKeyboard } from '../../hooks/useKeyboard.js';

interface HelpScreenProps {
	onBack: () => void;
}

export const HelpScreen: React.FC<HelpScreenProps> = ({ onBack }) => {
	// Register keyboard shortcuts
	useKeyboard({
		Q: onBack,
		ESCAPE: onBack,
	});

	return (
		<Box flexDirection="column" padding={1}>
			<Header title="zBANK HELP" />

			<Box flexDirection="column" marginTop={2}>
				<Text bold>Keyboard Shortcuts:</Text>
				<Text> Q - Quit/Logout</Text>
				<Text> R - Register new account</Text>
				<Text> H - Show help</Text>
				<Text> ESC - Go back</Text>
				<Text> ↑↓ - Navigate menus</Text>
				<Text> ↵ - Select/Submit</Text>
			</Box>

			<Box flexDirection="column" marginTop={2}>
				<Text bold>Test Accounts:</Text>
				<Text> Account: 0000012345, PIN: 1111 (Balance: $100.00)</Text>
				<Text> Account: 1234567890, PIN: 1234 (Balance: $200.00)</Text>
			</Box>

			<Box flexDirection="column" marginTop={2}>
				<Text bold>Features:</Text>
				<Text> • Secure login with PIN authentication</Text>
				<Text> • Deposit and withdrawal transactions</Text>
				<Text> • Account registration</Text>
				<Text> • Transaction history</Text>
				<Text> • Local data storage</Text>
			</Box>

			<Footer hints={['[Q] Back', '[ESC] Back']} />
		</Box>
	);
};
