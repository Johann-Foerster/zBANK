/**
 * Footer - Common footer component with action hints
 *
 * Displays keyboard shortcuts and available actions at the bottom of screen
 */

import React from 'react';
import { Box, Text } from 'ink';

interface FooterProps {
	hints?: string[];
}

export const Footer: React.FC<FooterProps> = ({ hints = [] }) => {
	return (
		<Box flexDirection="column" marginTop={1}>
			<Box width={60}>
				<Text color="gray">{'─'.repeat(60)}</Text>
			</Box>
			{hints.length > 0 && (
				<Box marginTop={1} flexDirection="row" gap={2}>
					{hints.map((hint, index) => (
						<Text key={index} dimColor>
							{hint}
						</Text>
					))}
				</Box>
			)}
		</Box>
	);
};
