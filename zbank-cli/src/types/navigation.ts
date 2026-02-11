/**
 * Navigation types and enums for the zBANK CLI application
 * 
 * Implements state machine pattern similar to COBOL mainframe application:
 * - State 0: Login Screen (ZLOGIN)
 * - State 1: Home/Transaction Screen (ZHOME)
 * - State 2: Registration Screen (ZRGSTR)
 * - State 3: Exit Screen
 * 
 * Additional states for enhanced UX:
 * - Splash Screen: Shown on startup
 * - Help Screen: User guidance and shortcuts
 */

/**
 * Application navigation states
 * Maps to COBOL screen states (0, 1, 2) with additional UX states
 */
export enum AppState {
  SPLASH = 'SPLASH',
  LOGIN = 'LOGIN',
  HOME = 'HOME',
  REGISTER = 'REGISTER',
  HELP = 'HELP',
  EXIT = 'EXIT'
}

/**
 * Navigation context interface
 * Provides navigation methods to all components
 */
export interface NavigationContext {
  currentState: AppState;
  previousState: AppState | null;
  navigateTo: (state: AppState) => void;
  goBack: () => void;
}
