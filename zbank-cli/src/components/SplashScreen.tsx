/**
 * SplashScreen - Branded splash screen shown on application startup
 *
 * Displays the zBANK logo with gradient colors and a loading message.
 * Automatically transitions to the login screen after 2 seconds.
 */

import React, { useEffect } from 'react';
import { Box, Text } from 'ink';
import BigText from 'ink-big-text';
import Gradient from 'ink-gradient';

interface SplashScreenProps {
	onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
	useEffect(() => {
		const timer = globalThis.setTimeout(onComplete, 2000);
		return () => globalThis.clearTimeout(timer);
	}, [onComplete]);

	return (
		<Box
			flexDirection="column"
			alignItems="center"
			justifyContent="center"
			paddingTop={2}
		>
			<Gradient name="rainbow">
				<BigText text="zBANK" />
			</Gradient>
			<Box marginTop={1}>
				<Text color="cyan">Modern CLI Banking Application</Text>
			</Box>
			<Box marginTop={1}>
				<Text dimColor>Loading...</Text>
			</Box>
		</Box>
	);
};
