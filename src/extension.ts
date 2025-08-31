// Legacy extension.ts file for compatibility with older test suites
// This file exports the same functionality as simple-extension.ts

export * from './simple-extension';

// Re-export the activate and deactivate functions for backward compatibility
import { activate as activateSimple, deactivate as deactivateSimple } from './simple-extension';

export const activate = activateSimple;
export const deactivate = deactivateSimple;
