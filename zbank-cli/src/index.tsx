#!/usr/bin/env node
import React from 'react';
import { render, Box, Text } from 'ink';
import Gradient from 'ink-gradient';
import BigText from 'ink-big-text';

const App = () => {
	return (
		<Box flexDirection="column" padding={1}>
			<Gradient name="rainbow">
				<BigText text="zBANK" />
			</Gradient>
			<Box marginTop={1}>
				<Text>
					🏦 Welcome to zBANK - Modern CLI Banking System
				</Text>
			</Box>
			<Box marginTop={1}>
				<Text dimColor>
					Powered by React Ink | Type safety with TypeScript
				</Text>
			</Box>
		</Box>
	);
};

render(<App />);
