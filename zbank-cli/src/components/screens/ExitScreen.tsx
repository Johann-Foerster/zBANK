/**
 * ExitScreen - Exit confirmation screen
 *
 * Displays goodbye message and terminates the application
 */

import React, { useEffect } from 'react';
import { Box, Text } from 'ink';
import { Header } from '../common/Header.js';

interface ExitScreenProps {
	onExit?: () => void;
}

export const ExitScreen: React.FC<ExitScreenProps> = ({ onExit }) => {
	useEffect(() => {
		// Auto-exit after 1 second
		const timer = globalThis.setTimeout(() => {
			if (onExit) {
				onExit();
			} else {
				process.exit(0);
			}
		}, 1000);

		return () => globalThis.clearTimeout(timer);
	}, [onExit]);

	return (
		<Box flexDirection="column">
			<Header showLogo={false} />
			<Box flexDirection="column" padding={2} alignItems="center">
				<Text color="cyan" bold>
					👋 Thank you for banking with zBANK!
				</Text>
				<Box marginTop={1}>
					<Text dimColor>Logging out...</Text>
				</Box>
			</Box>
		</Box>
	);
};
