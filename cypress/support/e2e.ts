// cypress/support/e2e.ts
// This file is processed and loaded automatically before your test files.

import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Hide fetch/XHR requests
const app = window.top;
if (app && !app.document.head.querySelector('[data-hide-command-log-request]')) {
  const style = app.document.createElement('style');
  style.innerHTML = '.command-name-request, .command-name-xhr { display: none }';
  style.setAttribute('data-hide-command-log-request', '');
  app.document.head.appendChild(style);
}

// Global before hook for all tests
beforeEach(() => {
  // Clear local storage and session storage
  cy.clearLocalStorage()
  cy.clearCookies()
  
  // Set default viewport
  cy.viewport(1280, 720)
})

// Handle uncaught exceptions
Cypress.on('uncaught:exception', (err, runnable) => {
  // VS Code extension related errors we want to ignore
  if (err.message.includes('vscode') || 
      err.message.includes('extension') ||
      err.message.includes('ResizeObserver loop limit exceeded')) {
    return false
  }
  // We still want to fail on other errors
  return true
})

// Add custom commands for extension testing
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to test VS Code extension functionality
       */
      testExtensionFeature(feature: string): Chainable<Element>
      
      /**
       * Custom command to verify quality analysis results
       */
      verifyQualityAnalysis(tool: string): Chainable<Element>
      
      /**
       * Custom command to test API integrations
       */
      testApiIntegration(service: string): Chainable<Element>
    }
  }
}
