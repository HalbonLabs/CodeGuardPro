import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    // Remove baseUrl for file-based testing
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',
    downloadsFolder: 'cypress/downloads',
    fixturesFolder: 'cypress/fixtures',
    video: true,
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000,
    watchForFileChanges: false,
    retries: {
      runMode: 2,
      openMode: 0
    },
    env: {
      codeCoverage: {
        url: 'http://localhost:3001/__coverage__'
      }
    },
    setupNodeEvents(on, config) {
      // implement node event listeners here
      on('task', {
        log(message) {
          console.log(message)
          return null
        }
      })
      
      // Code coverage task
      on('task', {
        coverage(coverage) {
          return coverage
        }
      })
      
      return config
    },
  },
  
  component: {
    devServer: {
      framework: 'react',
      bundler: 'webpack',
    },
    specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/component.ts',
  },
  
  // VS Code Extension specific configuration
  experimentalStudio: true,
  experimentalWebKitSupport: true,
  
  // Security and performance
  chromeWebSecurity: false,
  modifyObstructiveCode: false,
  
  // Timeouts for VS Code extension testing
  numTestsKeptInMemory: 10,
  
  // Reporter configuration
  reporter: 'spec',
  reporterOptions: {
    mochaFile: 'cypress/results/test-results-[hash].xml',
    toConsole: true,
    charts: true,
    reportPageTitle: 'CodeGuard Pro Cypress Tests',
    embeddedScreenshots: true,
    inlineAssets: true
  }
})
