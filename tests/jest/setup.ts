// Jest setup file for CodeGuard Pro Extension testing
import { jest } from '@jest/globals';

// Mock VS Code API
const mockVSCode = {
  window: {
    showInformationMessage: jest.fn(),
    showWarningMessage: jest.fn(),
    showErrorMessage: jest.fn(),
    createStatusBarItem: jest.fn(() => ({
      text: '',
      tooltip: '',
      show: jest.fn(),
      hide: jest.fn(),
      dispose: jest.fn()
    })),
    createWebviewPanel: jest.fn(),
    createTreeView: jest.fn(),
    registerTreeDataProvider: jest.fn(),
    showQuickPick: jest.fn(),
    showInputBox: jest.fn()
  },
  commands: {
    registerCommand: jest.fn(),
    executeCommand: jest.fn()
  },
  workspace: {
    getConfiguration: jest.fn(() => ({
      get: jest.fn(),
      update: jest.fn(),
      has: jest.fn()
    })),
    workspaceFolders: [],
    onDidChangeConfiguration: jest.fn(),
    onDidSaveTextDocument: jest.fn(),
    findFiles: jest.fn()
  },
  extensions: {
    getExtension: jest.fn(),
    all: []
  },
  Uri: {
    file: jest.fn(),
    parse: jest.fn()
  },
  ViewColumn: {
    One: 1,
    Two: 2,
    Three: 3
  },
  StatusBarAlignment: {
    Left: 1,
    Right: 2
  },
  TreeItemCollapsibleState: {
    None: 0,
    Collapsed: 1,
    Expanded: 2
  },
  Disposable: {
    from: jest.fn()
  },
  EventEmitter: jest.fn(() => ({
    event: jest.fn(),
    fire: jest.fn(),
    dispose: jest.fn()
  })),
  languages: {
    registerCodeActionsProvider: jest.fn(),
    registerHoverProvider: jest.fn(),
    registerDefinitionProvider: jest.fn()
  },
  env: {
    clipboard: {
      writeText: jest.fn(),
      readText: jest.fn()
    }
  }
};

// Set up global mocks
global.vscode = mockVSCode;

// Mock Node.js modules commonly used in VS Code extensions
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
    access: jest.fn(),
    stat: jest.fn()
  }
}));

jest.mock('path', () => ({
  join: jest.fn((...args) => args.join('/')),
  resolve: jest.fn(),
  dirname: jest.fn(),
  basename: jest.fn(),
  extname: jest.fn()
}));

jest.mock('child_process', () => ({
  exec: jest.fn(),
  spawn: jest.fn(),
  execSync: jest.fn()
}));

// Mock axios for API testing
jest.mock('axios', () => ({
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    create: jest.fn(() => ({
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn()
    }))
  }
}));

// Console setup for better test output
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
  
  // Reset console spies
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterEach(() => {
  // Restore console methods
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Global test utilities
global.createMockExtensionContext = () => ({
  subscriptions: [],
  workspaceState: {
    get: jest.fn(),
    update: jest.fn()
  },
  globalState: {
    get: jest.fn(),
    update: jest.fn()
  },
  extensionPath: '/mock/extension/path',
  extensionUri: mockVSCode.Uri.file('/mock/extension/path'),
  storagePath: '/mock/storage/path',
  globalStoragePath: '/mock/global/storage/path',
  logPath: '/mock/log/path',
  asAbsolutePath: jest.fn((relativePath) => `/mock/extension/path/${relativePath}`)
});

// Quality analysis mock utilities
global.createMockAnalysisResult = (tool: string, issues = 0) => ({
  tool,
  timestamp: new Date().toISOString(),
  status: 'completed',
  issues: Array.from({ length: issues }, (_, i) => ({
    id: `${tool}-issue-${i + 1}`,
    severity: ['error', 'warning', 'info'][i % 3],
    message: `Test issue ${i + 1} from ${tool}`,
    file: `src/test-file-${i + 1}.ts`,
    line: (i + 1) * 10,
    column: 5
  })),
  summary: {
    total: issues,
    errors: Math.floor(issues / 3),
    warnings: Math.floor(issues / 3),
    info: issues - 2 * Math.floor(issues / 3)
  }
});

// API response mock utilities
global.createMockApiResponse = (service: string, success = true) => ({
  status: success ? 200 : 500,
  data: success ? {
    service,
    status: 'success',
    data: [],
    timestamp: new Date().toISOString()
  } : {
    error: `Mock error from ${service}`,
    code: 'MOCK_ERROR'
  }
});

// Extended Jest matchers
(expect as any).extend({
  toBeValidAnalysisResult(received) {
    const pass = received &&
      typeof received.tool === 'string' &&
      typeof received.timestamp === 'string' &&
      typeof received.status === 'string' &&
      Array.isArray(received.issues);

    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid analysis result`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid analysis result`,
        pass: false,
      };
    }
  },
});

// TypeScript type declarations for global utilities
declare global {
  var vscode: any;
  var createMockExtensionContext: () => any;
  var createMockAnalysisResult: (tool: string, issues?: number) => any;
  var createMockApiResponse: (service: string, success?: boolean) => any;
  
  namespace jest {
    interface Matchers<R> {
      toBeValidAnalysisResult(): R;
    }
  }
}
