#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import { NavigationProvider } from './contexts/NavigationContext.js';
import { ServiceProvider } from './contexts/ServiceContext.js';
import { App } from './components/App.js';

render(
	<ServiceProvider>
		<NavigationProvider>
			<App />
		</NavigationProvider>
	</ServiceProvider>
);
