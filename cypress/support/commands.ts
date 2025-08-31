// cypress/support/commands.ts
// Custom commands for CodeGuard Pro VS Code extension testing

Cypress.Commands.add('testExtensionFeature', (feature: string) => {
  cy.log(`Testing extension feature: ${feature}`)
  
  switch (feature) {
    case 'sidebar':
      cy.get('[data-testid="quality-hub-sidebar"]').should('be.visible')
      break
    case 'status-bar':
      cy.get('[data-testid="quality-hub-status"]').should('exist')
      break
    case 'commands':
      cy.get('[data-testid="quality-hub-commands"]').should('exist')
      break
    default:
      cy.log(`Unknown feature: ${feature}`)
  }
})

Cypress.Commands.add('verifyQualityAnalysis', (tool: string) => {
  cy.log(`Verifying quality analysis for: ${tool}`)
  
  // Simulate running the tool
  cy.get(`[data-tool="${tool}"]`).click()
  
  // Wait for analysis to complete
  cy.get('[data-testid="analysis-complete"]', { timeout: 30000 })
    .should('be.visible')
  
  // Verify results are displayed
  cy.get('[data-testid="analysis-results"]')
    .should('exist')
    .and('not.be.empty')
})

Cypress.Commands.add('testApiIntegration', (service: string) => {
  cy.log(`Testing API integration for: ${service}`)
  
  // Mock API responses for testing
  cy.intercept('GET', `**/api/${service}/**`, { 
    statusCode: 200, 
    body: { status: 'success', data: [] } 
  }).as(`${service}Api`)
  
  // Test the integration
  cy.get(`[data-service="${service}"]`).click()
  cy.wait(`@${service}Api`)
  
  // Verify connection status
  cy.get(`[data-testid="${service}-status"]`)
    .should('contain.text', 'Connected')
})

// Add command for testing extension installation/activation
Cypress.Commands.add('activateExtension', () => {
  cy.log('Activating CodeGuard Pro extension')
  
  // Simulate extension activation
  cy.window().then((win) => {
    // Mock VS Code API
    (win as any).vscode = {
      postMessage: cy.stub().as('vscodePostMessage'),
      getState: cy.stub().returns({}),
      setState: cy.stub()
    }
  })
})

// Command for testing file analysis
Cypress.Commands.add('analyzeFile', (filePath: string) => {
  cy.log(`Analyzing file: ${filePath}`)
  
  // Mock file content
  cy.fixture('sample-code.ts').then((content) => {
    cy.get('[data-testid="file-input"]').type(filePath)
    cy.get('[data-testid="file-content"]').invoke('val', content)
    cy.get('[data-testid="analyze-button"]').click()
  })
})

// Extend Cypress command types
declare global {
  namespace Cypress {
    interface Chainable {
      activateExtension(): Chainable<void>
      analyzeFile(filePath: string): Chainable<void>
    }
  }
}
