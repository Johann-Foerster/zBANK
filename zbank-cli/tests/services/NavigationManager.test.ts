/**
 * Tests for NavigationManager
 * 
 * Tests the state machine navigation logic
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { NavigationManager } from '../../src/services/NavigationManager.js';
import { AppState } from '../../src/types/navigation.js';

describe('NavigationManager', () => {
  let nav: NavigationManager;

  beforeEach(() => {
    nav = new NavigationManager();
  });

  describe('constructor', () => {
    it('should start in LOGIN state by default', () => {
      expect(nav.getCurrentState()).toBe(AppState.LOGIN);
    });

    it('should accept custom initial state', () => {
      const customNav = new NavigationManager(AppState.HOME);
      expect(customNav.getCurrentState()).toBe(AppState.HOME);
    });

    it('should start with empty history', () => {
      expect(nav.getHistory()).toEqual([]);
      expect(nav.canGoBack()).toBe(false);
    });
  });

  describe('navigateTo', () => {
    it('should navigate to HOME after successful login', () => {
      nav.navigateTo(AppState.HOME);
      expect(nav.getCurrentState()).toBe(AppState.HOME);
    });

    it('should add current state to history when navigating', () => {
      nav.navigateTo(AppState.HOME);
      expect(nav.getHistory()).toEqual([AppState.LOGIN]);
    });

    it('should maintain navigation history for multiple transitions', () => {
      nav.navigateTo(AppState.HOME);
      nav.navigateTo(AppState.REGISTER);
      
      const history = nav.getHistory();
      expect(history).toEqual([AppState.LOGIN, AppState.HOME]);
      expect(nav.getCurrentState()).toBe(AppState.REGISTER);
    });

    it('should allow navigating to any state', () => {
      nav.navigateTo(AppState.EXIT);
      expect(nav.getCurrentState()).toBe(AppState.EXIT);
    });
  });

  describe('goBack', () => {
    it('should navigate back to previous state', () => {
      nav.navigateTo(AppState.HOME);
      nav.navigateTo(AppState.REGISTER);
      
      const result = nav.goBack();
      
      expect(result).toBe(true);
      expect(nav.getCurrentState()).toBe(AppState.HOME);
    });

    it('should remove last state from history when going back', () => {
      nav.navigateTo(AppState.HOME);
      nav.navigateTo(AppState.REGISTER);
      nav.goBack();
      
      expect(nav.getHistory()).toEqual([AppState.LOGIN]);
    });

    it('should return false when no history available', () => {
      const result = nav.goBack();
      expect(result).toBe(false);
      expect(nav.getCurrentState()).toBe(AppState.LOGIN);
    });

    it('should handle multiple back navigations', () => {
      nav.navigateTo(AppState.HOME);
      nav.navigateTo(AppState.REGISTER);
      nav.navigateTo(AppState.EXIT);
      
      nav.goBack(); // EXIT -> REGISTER
      expect(nav.getCurrentState()).toBe(AppState.REGISTER);
      
      nav.goBack(); // REGISTER -> HOME
      expect(nav.getCurrentState()).toBe(AppState.HOME);
      
      nav.goBack(); // HOME -> LOGIN
      expect(nav.getCurrentState()).toBe(AppState.LOGIN);
    });
  });

  describe('canGoBack', () => {
    it('should return false initially', () => {
      expect(nav.canGoBack()).toBe(false);
    });

    it('should return true after navigation', () => {
      nav.navigateTo(AppState.HOME);
      expect(nav.canGoBack()).toBe(true);
    });

    it('should return false after going back to start', () => {
      nav.navigateTo(AppState.HOME);
      nav.goBack();
      expect(nav.canGoBack()).toBe(false);
    });
  });

  describe('getHistory', () => {
    it('should return empty array initially', () => {
      expect(nav.getHistory()).toEqual([]);
    });

    it('should return copy of history array', () => {
      nav.navigateTo(AppState.HOME);
      const history1 = nav.getHistory();
      const history2 = nav.getHistory();
      
      expect(history1).toEqual(history2);
      expect(history1).not.toBe(history2); // Different object references
    });

    it('should not allow external modification of history', () => {
      nav.navigateTo(AppState.HOME);
      const history = nav.getHistory();
      history.push(AppState.EXIT);
      
      expect(nav.getHistory()).toEqual([AppState.LOGIN]);
    });
  });

  describe('clearHistory', () => {
    it('should clear navigation history', () => {
      nav.navigateTo(AppState.HOME);
      nav.navigateTo(AppState.REGISTER);
      
      nav.clearHistory();
      
      expect(nav.getHistory()).toEqual([]);
      expect(nav.canGoBack()).toBe(false);
    });

    it('should not change current state', () => {
      nav.navigateTo(AppState.HOME);
      nav.clearHistory();
      
      expect(nav.getCurrentState()).toBe(AppState.HOME);
    });
  });

  describe('reset', () => {
    it('should reset to LOGIN state by default', () => {
      nav.navigateTo(AppState.HOME);
      nav.navigateTo(AppState.REGISTER);
      
      nav.reset();
      
      expect(nav.getCurrentState()).toBe(AppState.LOGIN);
      expect(nav.getHistory()).toEqual([]);
    });

    it('should accept custom reset state', () => {
      nav.navigateTo(AppState.HOME);
      nav.reset(AppState.REGISTER);
      
      expect(nav.getCurrentState()).toBe(AppState.REGISTER);
      expect(nav.getHistory()).toEqual([]);
    });
  });

  describe('state machine flow', () => {
    it('should handle typical login flow', () => {
      // Start at login
      expect(nav.getCurrentState()).toBe(AppState.LOGIN);
      
      // Login success -> HOME
      nav.navigateTo(AppState.HOME);
      expect(nav.getCurrentState()).toBe(AppState.HOME);
      
      // Go to registration
      nav.navigateTo(AppState.REGISTER);
      expect(nav.getCurrentState()).toBe(AppState.REGISTER);
      
      // Back to home
      nav.goBack();
      expect(nav.getCurrentState()).toBe(AppState.HOME);
      
      // Logout -> EXIT
      nav.navigateTo(AppState.EXIT);
      expect(nav.getCurrentState()).toBe(AppState.EXIT);
    });

    it('should handle registration then login flow', () => {
      // From login to register
      nav.navigateTo(AppState.REGISTER);
      expect(nav.getCurrentState()).toBe(AppState.REGISTER);
      
      // Complete registration -> back to LOGIN
      nav.reset(AppState.LOGIN);
      expect(nav.getCurrentState()).toBe(AppState.LOGIN);
      expect(nav.getHistory()).toEqual([]);
    });
  });
});
