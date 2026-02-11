/**
 * useKeyboard - Hook for handling keyboard shortcuts
 * 
 * Provides a convenient way to handle keyboard input
 * with support for letter keys and special keys.
 */

import { useInput } from 'ink';

type KeyHandler = () => void;

interface KeyHandlers {
  [key: string]: KeyHandler;
}

/**
 * Hook to register keyboard handlers
 * 
 * @param handlers - Map of keys to handler functions
 *                   Keys are case-insensitive letters (e.g., 'Q', 'R')
 *                   Special key 'ESCAPE' can be used for ESC key
 * 
 * @example
 * useKeyboard({
 *   Q: () => handleQuit(),
 *   R: () => handleRegister(),
 *   ESCAPE: () => handleQuit()
 * });
 */
export function useKeyboard(handlers: KeyHandlers): void {
  useInput((input, key) => {
    // Handle special keys
    if (key.escape && handlers['ESCAPE']) {
      handlers['ESCAPE']();
      return;
    }

    // Handle letter keys (case-insensitive)
    const upperInput = input.toUpperCase();
    const handler = handlers[upperInput];
    if (handler) {
      handler();
    }
  });
}
