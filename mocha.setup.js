// Mocha setup file for VS Code extension testing
const path = require('path');

// Set up environment variables
process.env.NODE_ENV = 'test';

// Mock VS Code API for testing
const vscode = {
  window: {
    showInformationMessage: () => Promise.resolve(),
    showErrorMessage: () => Promise.resolve(),
    showWarningMessage: () => Promise.resolve(),
    showInputBox: () => Promise.resolve('test-input'),
    showQuickPick: () => Promise.resolve('test-pick'),
    createStatusBarItem: () => ({
      text: '',
      tooltip: '',
      show: () => {},
      hide: () => {},
      dispose: () => {}
    })
  },
  workspace: {
    getConfiguration: () => ({
      get: () => true,
      update: () => Promise.resolve(),
      inspect: () => ({ defaultValue: undefined, globalValue: undefined, workspaceValue: undefined })
    }),
    workspaceFolders: [
      {
        uri: { fsPath: process.cwd() },
        name: 'test-workspace',
        index: 0
      }
    ],
    onDidChangeConfiguration: () => ({ dispose: () => {} }),
    onDidChangeWorkspaceFolders: () => ({ dispose: () => {} })
  },
  commands: {
    registerCommand: (command, callback) => ({
      dispose: () => {}
    }),
    executeCommand: () => Promise.resolve()
  },
  Uri: {
    file: (path) => ({ fsPath: path, scheme: 'file' }),
    parse: (uri) => ({ fsPath: uri, scheme: 'file' })
  },
  StatusBarAlignment: {
    Left: 1,
    Right: 2
  },
  TreeDataProvider: class {},
  EventEmitter: class {
    constructor() {
      this.event = () => ({ dispose: () => {} });
    }
    fire() {}
  },
  ExtensionContext: class {},
  ViewColumn: {
    One: 1,
    Two: 2,
    Three: 3
  }
};

// Make VS Code API globally available
global.vscode = vscode;

// Test utilities
global.testUtils = {
  createMockService: () => ({
    lintCode: async (targetPath, fix, tool) => {
      return `Mocha mock: Linted ${targetPath} with ${tool}, fix: ${fix}`;
    },
    runSecurityScan: async (targetPath, level, dependencies) => {
      return `Mocha mock: Security scan of ${targetPath}, level: ${level}, deps: ${dependencies}`;
    },
    runE2ETests: async (framework, spec, headless, browser) => {
      return `Mocha mock: E2E tests with ${framework}, spec: ${spec}, headless: ${headless}, browser: ${browser}`;
    }
  }),
  createMockExtensionContext: () => ({
    subscriptions: [],
    workspaceState: {
      get: () => undefined,
      update: () => Promise.resolve()
    },
    globalState: {
      get: () => undefined,
      update: () => Promise.resolve()
    },
    extensionPath: path.join(__dirname, '..'),
    storagePath: path.join(__dirname, '..', 'storage'),
    globalStoragePath: path.join(__dirname, '..', 'global-storage')
  })
};

// Configure longer timeout for VS Code extension tests
if (typeof global.setTimeout !== 'undefined') {
  global.setTimeout = global.setTimeout.bind(global);
}

console.log('📋 Mocha setup completed - VS Code API mocked successfully');
