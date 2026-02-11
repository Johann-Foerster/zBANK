/**
 * NavigationManager - State machine manager for application navigation
 *
 * Manages application state transitions similar to COBOL screen state machine.
 * Maintains navigation history and provides state transition methods.
 */

import { AppState } from '../types/navigation.js';

export class NavigationManager {
	private state: AppState;
	private history: AppState[];

	constructor(initialState: AppState = AppState.LOGIN) {
		this.state = initialState;
		this.history = [];
	}

	/**
	 * Get the current navigation state
	 */
	getCurrentState(): AppState {
		return this.state;
	}

	/**
	 * Navigate to a new state
	 * Adds current state to history before transitioning
	 */
	navigateTo(newState: AppState): void {
		this.history.push(this.state);
		this.state = newState;
	}

	/**
	 * Navigate back to previous state
	 * Returns false if no history available
	 */
	goBack(): boolean {
		if (this.history.length === 0) {
			return false;
		}

		this.state = this.history.pop()!;
		return true;
	}

	/**
	 * Check if back navigation is available
	 */
	canGoBack(): boolean {
		return this.history.length > 0;
	}

	/**
	 * Get navigation history
	 * Returns a copy to prevent external modification
	 */
	getHistory(): AppState[] {
		return [...this.history];
	}

	/**
	 * Clear navigation history
	 * Useful when logging out or resetting application
	 */
	clearHistory(): void {
		this.history = [];
	}

	/**
	 * Reset to initial state and clear history
	 */
	reset(initialState: AppState = AppState.LOGIN): void {
		this.state = initialState;
		this.history = [];
	}
}
