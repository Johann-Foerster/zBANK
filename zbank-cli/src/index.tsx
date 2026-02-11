#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import { NavigationProvider } from './contexts/NavigationContext.js';
import { ServiceProvider } from './contexts/ServiceContext.js';
import { App } from './components/App.js';
import { initializeStorage } from './utils/storage-init.js';

// Initialize storage with seed data if needed
(async () => {
	await initializeStorage();

	// Render the application
	render(
		<ServiceProvider>
			<NavigationProvider>
				<App />
			</NavigationProvider>
		</ServiceProvider>
	);
})();
