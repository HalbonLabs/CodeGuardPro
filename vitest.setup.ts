import { vi } from 'vitest'

// Mock VS Code API
const vscode = {
  workspace: {
    getConfiguration: vi.fn().mockReturnValue({
      get: vi.fn(),
      update: vi.fn(),
      inspect: vi.fn(),
      has: vi.fn()
    }),
    workspaceFolders: [
      {
        uri: { fsPath: '/mock/workspace' },
        name: 'MockWorkspace',
        index: 0
      }
    ],
    findFiles: vi.fn().mockResolvedValue([]),
    openTextDocument: vi.fn(),
    onDidChangeConfiguration: vi.fn(),
    onDidChangeWorkspaceFolders: vi.fn(),
    onDidChangeTextDocument: vi.fn(),
    onDidSaveTextDocument: vi.fn(),
    rootPath: '/mock/workspace',
    name: 'MockWorkspace'
  },
  window: {
    showInformationMessage: vi.fn().mockResolvedValue(undefined),
    showWarningMessage: vi.fn().mockResolvedValue(undefined),
    showErrorMessage: vi.fn().mockResolvedValue(undefined),
    showQuickPick: vi.fn().mockResolvedValue(undefined),
    showInputBox: vi.fn().mockResolvedValue(undefined),
    createStatusBarItem: vi.fn().mockReturnValue({
      text: '',
      tooltip: '',
      command: '',
      show: vi.fn(),
      hide: vi.fn(),
      dispose: vi.fn()
    }),
    activeTextEditor: undefined,
    visibleTextEditors: [],
    onDidChangeActiveTextEditor: vi.fn(),
    onDidChangeVisibleTextEditors: vi.fn(),
    onDidChangeTextEditorSelection: vi.fn(),
    createWebviewPanel: vi.fn().mockReturnValue({
      webview: {
        html: '',
        postMessage: vi.fn(),
        onDidReceiveMessage: vi.fn()
      },
      onDidDispose: vi.fn(),
      reveal: vi.fn(),
      dispose: vi.fn()
    }),
    createTreeView: vi.fn().mockReturnValue({
      onDidChangeSelection: vi.fn(),
      onDidChangeVisibility: vi.fn(),
      reveal: vi.fn(),
      dispose: vi.fn()
    }),
    registerTreeDataProvider: vi.fn(),
    showTextDocument: vi.fn()
  },
  commands: {
    registerCommand: vi.fn().mockReturnValue({
      dispose: vi.fn()
    }),
    executeCommand: vi.fn().mockResolvedValue(undefined),
    getCommands: vi.fn().mockResolvedValue([])
  },
  languages: {
    registerCodeActionsProvider: vi.fn().mockReturnValue({
      dispose: vi.fn()
    }),
    registerCompletionItemProvider: vi.fn().mockReturnValue({
      dispose: vi.fn()
    }),
    registerDefinitionProvider: vi.fn().mockReturnValue({
      dispose: vi.fn()
    }),
    registerDocumentFormattingEditProvider: vi.fn().mockReturnValue({
      dispose: vi.fn()
    }),
    registerHoverProvider: vi.fn().mockReturnValue({
      dispose: vi.fn()
    }),
    createDiagnosticCollection: vi.fn().mockReturnValue({
      set: vi.fn(),
      delete: vi.fn(),
      clear: vi.fn(),
      dispose: vi.fn()
    })
  },
  Uri: {
    file: vi.fn((path) => ({ fsPath: path, scheme: 'file', path })),
    parse: vi.fn((uri) => ({ fsPath: uri, scheme: 'file', path: uri })),
    joinPath: vi.fn((...paths) => ({ fsPath: paths.join('/'), scheme: 'file', path: paths.join('/') }))
  },
  Range: class MockRange {
    constructor(
      public start: any,
      public end: any
    ) {}
  },
  Position: class MockPosition {
    constructor(
      public line: number,
      public character: number
    ) {}
  },
  Selection: class MockSelection {
    constructor(
      public start: any,
      public end: any
    ) {}
  },
  TextEdit: {
    replace: vi.fn((range, text) => ({ range, newText: text })),
    insert: vi.fn((position, text) => ({ range: { start: position, end: position }, newText: text })),
    delete: vi.fn((range) => ({ range, newText: '' }))
  },
  WorkspaceEdit: class MockWorkspaceEdit {
    set = vi.fn()
    replace = vi.fn()
    insert = vi.fn()
    delete = vi.fn()
  },
  DiagnosticSeverity: {
    Error: 0,
    Warning: 1,
    Information: 2,
    Hint: 3
  },
  StatusBarAlignment: {
    Left: 1,
    Right: 2
  },
  ViewColumn: {
    Active: -1,
    Beside: -2,
    One: 1,
    Two: 2,
    Three: 3
  },
  TreeItemCollapsibleState: {
    None: 0,
    Collapsed: 1,
    Expanded: 2
  },
  ConfigurationTarget: {
    Global: 1,
    Workspace: 2,
    WorkspaceFolder: 3
  }
}

// Mock extension context
interface MockExtensionContext {
  subscriptions: any[]
  workspaceState: any
  globalState: any
  extensionPath: string
  storagePath?: string
  globalStoragePath: string
  logPath: string
  extensionUri: any
  environmentVariableCollection: any
  asAbsolutePath: (relativePath: string) => string
}

// Mock quality tools service
interface MockService {
  lintCode: (code: string) => Promise<any>
  formatCode: (code: string) => Promise<string>
  analyzeCode: (filePath: string) => Promise<any>
  runTests: () => Promise<any>
  scanSecurity: () => Promise<any>
  checkDependencies: () => Promise<any>
  generateReport: () => Promise<any>
  runSecurityScan: () => Promise<any>
  runE2ETests: () => Promise<any>
  runUnitTests: () => Promise<any>
  performCodeComplexityAnalysis: () => Promise<any>
}

// Global mocks for test environment
const createMockExtensionContext = (): MockExtensionContext => ({
  subscriptions: [],
  workspaceState: {
    get: vi.fn(),
    update: vi.fn()
  },
  globalState: {
    get: vi.fn(),
    update: vi.fn(),
    keys: vi.fn().mockReturnValue([])
  },
  extensionPath: '/mock/extension/path',
  storagePath: '/mock/storage/path',
  globalStoragePath: '/mock/global/storage/path',
  logPath: '/mock/log/path',
  extensionUri: vscode.Uri.file('/mock/extension/path'),
  environmentVariableCollection: {
    persistent: true,
    replace: vi.fn(),
    append: vi.fn(),
    prepend: vi.fn(),
    get: vi.fn(),
    forEach: vi.fn(),
    delete: vi.fn(),
    clear: vi.fn()
  },
  asAbsolutePath: (relativePath: string) => `/mock/extension/path/${relativePath}`
})

const createMockService = (): MockService => ({
  lintCode: vi.fn().mockResolvedValue({ issues: [], fixed: true }),
  formatCode: vi.fn().mockImplementation((code) => Promise.resolve(code)),
  analyzeCode: vi.fn().mockResolvedValue({ 
    complexity: 5, 
    maintainability: 85, 
    issues: []
  }),
  runTests: vi.fn().mockResolvedValue({ 
    passed: 10, 
    failed: 0, 
    total: 10 
  }),
  scanSecurity: vi.fn().mockResolvedValue({ 
    vulnerabilities: [], 
    riskLevel: 'low' 
  }),
  checkDependencies: vi.fn().mockResolvedValue({ 
    outdated: [], 
    vulnerable: [] 
  }),
  generateReport: vi.fn().mockResolvedValue({ 
    timestamp: new Date().toISOString(),
    summary: 'All checks passed'
  }),
  runSecurityScan: vi.fn().mockResolvedValue({ 
    vulnerabilities: [], 
    riskLevel: 'low' 
  }),
  runE2ETests: vi.fn().mockResolvedValue({ 
    passed: 5, 
    failed: 0, 
    total: 5 
  }),
  runUnitTests: vi.fn().mockResolvedValue({ 
    passed: 15, 
    failed: 0, 
    total: 15 
  }),
  performCodeComplexityAnalysis: vi.fn().mockResolvedValue({ 
    averageComplexity: 3.2, 
    maxComplexity: 8, 
    filesAnalyzed: 10 
  })
})

// Set up global mocks
;(globalThis as any).vscode = vscode
;(global as any).createMockExtensionContext = createMockExtensionContext
;(global as any).createMockService = createMockService

// Mock Node.js modules commonly used in VS Code extensions
vi.mock('fs', async () => {
  const actual = await vi.importActual('fs')
  
  // Create a mock function that returns different content based on file path
  const mockReadFileSync = vi.fn().mockImplementation((filePath) => {
    const path = filePath.toString()
    
    if (path.includes('package.json')) {
      return JSON.stringify({
        name: 'codeguard-pro',
        displayName: 'CodeGuard Pro',
        description: 'Professional code quality suite',
        version: '1.0.4',
        engines: {
          vscode: '^1.103.0'
        },
        scripts: {
          'test:vitest': 'npx vitest run',
          'test:vitest:watch': 'npx vitest',
          'test:vitest:ui': 'npx vitest --ui',
          'test:vitest:coverage': 'npx vitest run --coverage'
        },
        devDependencies: {
          vitest: '^3.2.4',
          '@vitest/ui': '^3.2.4',
          '@vitest/coverage-v8': '^3.2.4',
          typescript: '^5.9.2',
          '@types/vscode': '^1.103.0'
        },
        contributes: {
          commands: [
            {
              command: 'quality-hub.vitest',
              title: 'Run Vitest Tests'
            }
          ]
        }
      })
    }
    
    if (path.includes('tsconfig.json')) {
      return JSON.stringify({
        compilerOptions: {
          module: 'commonjs',
          target: 'ES2020',
          outDir: 'out',
          lib: ['ES2020'],
          sourceMap: true,
          rootDir: 'src',
          strict: true
        },
        exclude: ['node_modules', '.vscode-test']
      })
    }
    
    if (path.includes('vitest.config.ts')) {
      return `import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    include: ['tests/**/*.vitest.test.{js,ts}']
  }
})`
    }
    
    if (path.includes('.eslintrc.json')) {
      return JSON.stringify({
        extends: ['@typescript-eslint/recommended'],
        parser: '@typescript-eslint/parser',
        plugins: ['@typescript-eslint']
      })
    }
    
    if (path.includes('biome.json')) {
      return JSON.stringify({
        $schema: 'https://biomejs.dev/schemas/1.8.3/schema.json',
        organizeImports: { enabled: true },
        linter: { enabled: true }
      })
    }
    
    if (path.includes('audit-ci.json')) {
      return JSON.stringify({
        moderate: true,
        allowlist: []
      })
    }
    
    // Default return
    return '{"name": "codeguard-pro"}'
  })
  
  return {
    ...actual,
    default: {
      ...actual,
      existsSync: vi.fn().mockReturnValue(true),
      readFileSync: mockReadFileSync,
      writeFileSync: vi.fn(),
      statSync: vi.fn().mockReturnValue({
        isDirectory: vi.fn().mockReturnValue(true),
        isFile: vi.fn().mockReturnValue(false)
      })
    },
    existsSync: vi.fn().mockReturnValue(true),
    readFileSync: mockReadFileSync,
    writeFileSync: vi.fn(),
    statSync: vi.fn().mockReturnValue({
      isDirectory: vi.fn().mockReturnValue(true),
      isFile: vi.fn().mockReturnValue(false)
    }),
    promises: {
      readFile: vi.fn().mockImplementation((filePath) => Promise.resolve(mockReadFileSync(filePath))),
      writeFile: vi.fn().mockResolvedValue(undefined),
      access: vi.fn().mockResolvedValue(undefined)
    }
  }
})

vi.mock('path', async () => {
  const actual = await vi.importActual('path')
  return {
    ...actual,
    join: vi.fn().mockImplementation((...paths) => paths.join('/')),
    resolve: vi.fn().mockImplementation((...paths) => '/' + paths.join('/')),
    dirname: vi.fn().mockImplementation((path) => path.split('/').slice(0, -1).join('/')),
    basename: vi.fn().mockImplementation((path) => path.split('/').pop()),
    extname: vi.fn().mockImplementation((path) => {
      const parts = path.split('.')
      return parts.length > 1 ? '.' + parts.pop() : ''
    })
  }
})

vi.mock('child_process', () => ({
  exec: vi.fn((command, callback) => {
    setTimeout(() => callback(null, 'Mock command output', ''), 100)
  }),
  spawn: vi.fn().mockReturnValue({
    stdout: { on: vi.fn() },
    stderr: { on: vi.fn() },
    on: vi.fn((event, callback) => {
      if (event === 'close') setTimeout(() => callback(0), 100)
    })
  })
}))

console.log('✅ Vitest setup complete with VS Code API mocking')
