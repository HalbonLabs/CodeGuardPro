// cypress/support/component.ts
// Component testing support for VS Code extension

import './commands'

import { mount } from 'cypress/react'

// Add mount command for component testing
Cypress.Commands.add('mount', mount)

// Example support file for component testing
declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount
    }
  }
}
