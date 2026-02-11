/**
 * Header - Common header component with zBANK branding
 *
 * Displays the zBANK logo with gradient effect at the top of each screen
 */

import React from 'react';
import { Box, Text } from 'ink';
import Gradient from 'ink-gradient';
import BigText from 'ink-big-text';

interface HeaderProps {
	showLogo?: boolean;
	title?: string;
}

export const Header: React.FC<HeaderProps> = ({ showLogo = true, title }) => {
	return (
		<Box flexDirection="column" alignItems="center" paddingY={1}>
			{showLogo && (
				<Gradient name="rainbow">
					<BigText text="zBANK" font="tiny" />
				</Gradient>
			)}
			{title && (
				<Box marginTop={1}>
					<Text bold color="cyan">
						{title}
					</Text>
				</Box>
			)}
			<Box marginTop={1} width={60}>
				<Text color="gray">{'─'.repeat(60)}</Text>
			</Box>
		</Box>
	);
};
