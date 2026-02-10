#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import { NavigationProvider } from './contexts/NavigationContext.js';
import { App } from './components/App.js';

render(
	<NavigationProvider>
		<App />
	</NavigationProvider>
);
