/**
 * CodeGuard MCP Extension
 * Experimental MCP task runner for code quality tools
 */

import * as vscode from 'vscode';
import { discover, McpProvider } from './mcpDiscovery';

// Local types for interop with main extension's showResults command
type Issue = {
  file: string;
  line: number;
  rule: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  fix?: { applied: boolean; description?: string };
};
type RunResult = {
  tool: string;
  command: string;
  success: boolean;
  issues: Issue[];
  fixed: number;
  duration?: number;
  output?: string;
  error?: string;
};

let providers: McpProvider[] = [];
let treeDataProvider: McpTreeProvider;

/**
 * Extension activation
 */
export async function activate(context: vscode.ExtensionContext) {
  console.log('CodeGuard MCP extension is now active!');

  // Discover MCP providers on startup
  try {
    providers = await discover();
    console.log(`Discovered ${providers.length} MCP providers:`, providers.map(p => p.name));
  } catch (error) {
    console.error('Failed to discover MCP providers:', error);
    vscode.window.showErrorMessage('Failed to discover MCP providers. Check your configuration.');
  }

  // Register commands
  const commands = [
    vscode.commands.registerCommand('codeguard-mcp.runLinting', () => runCategory('linting')),
    vscode.commands.registerCommand('codeguard-mcp.runTesting', () => runCategory('testing')),
    vscode.commands.registerCommand('codeguard-mcp.runSecurity', () => runCategory('security')),
    vscode.commands.registerCommand('codeguard-mcp.runAnalysis', () => runCategory('analysis')),
    vscode.commands.registerCommand('codeguard-mcp.runDependencies', () => runCategory('dependencies')),
    vscode.commands.registerCommand('codeguard-mcp.runAllWithAI', runAllWithAI),
    vscode.commands.registerCommand('codeguard-mcp.undoLastFix', undoLastFix),
    vscode.commands.registerCommand('codeguard-mcp.showResults', () => showLastResults()),
    vscode.commands.registerCommand('codeguard-mcp.refreshTree', () => refreshProviders()),
    vscode.commands.registerCommand('codeguard-mcp.runProvider', (providerName: string) => runSpecificProvider(providerName))
  ];

  context.subscriptions.push(...commands);

  // Register tree data provider for sidebar
  treeDataProvider = new McpTreeProvider();
  const treeView = vscode.window.createTreeView('codeguard.mcpProviders', {
    treeDataProvider: treeDataProvider,
    showCollapseAll: true
  });
  
  // Subscribe the tree view to the context
  context.subscriptions.push(treeView);

  // Refresh tree when providers change
  treeDataProvider.refresh();
  
  // Show a welcome message to confirm the extension is active
  vscode.window.showInformationMessage(
    'MCP Task Runner is active. MCP Providers appear in CodeGuard Pro.',
    'Open CodeGuard Pro',
    'Test MCP'
  ).then(selection => {
    if (selection === 'Open CodeGuard Pro') {
      vscode.commands.executeCommand('workbench.view.extension.quality-hub-webview');
    } else if (selection === 'Test MCP') {
      vscode.commands.executeCommand('codeguard-mcp.runLinting');
    }
  });
}

let lastResults: { results: RunResult[], remaining: Issue[] } | null = null;

/**
 * Run tools for a specific category
 */
async function runCategory(category: string): Promise<void> {
  try {
    vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: `Running ${category} tools...`,
      cancellable: false
    }, async (progress) => {
      const results: RunResult[] = [];
      const remaining: Issue[] = [];

      // Find providers with capabilities for this category
      const relevantProviders = providers.filter(provider => 
        provider.capabilities.some(cap => cap.category === category)
      );

      if (relevantProviders.length === 0) {
        vscode.window.showWarningMessage(`No MCP providers found for ${category} category.`);
        return;
      }

      progress.report({ message: `Found ${relevantProviders.length} providers` });

      // Run each relevant provider
      for (const provider of relevantProviders) {
        const categoryCapabilities = provider.capabilities.filter(cap => cap.category === category);
        
        for (const capability of categoryCapabilities) {
          try {
            progress.report({ message: `Running ${capability.id}...` });
            
            const startTime = Date.now();
            const result = await provider.run(capability.id, capability.commands[0] || 'run', {
              workspaceRoot: vscode.workspace.workspaceFolders?.[0]?.uri.fsPath
            });
            const duration = Date.now() - startTime;

            // Create mock issues for demonstration
            const mockIssues: Issue[] = [
              {
                file: 'src/example.ts',
                line: 10,
                rule: `${capability.id}/example-rule`,
                message: `Example issue from ${capability.id}`,
                severity: 'warning'
              }
            ];

            results.push({
              tool: capability.id,
              command: capability.commands[0] || 'run',
              success: result.success,
              issues: mockIssues,
              fixed: 0,
              duration,
              output: result.message || `Executed ${capability.id}`
            });

            // Add to remaining issues
            remaining.push(...mockIssues);

          } catch (error) {
            console.error(`Error running ${capability.id}:`, error);
            results.push({
              tool: capability.id,
              command: capability.commands[0] || 'run',
              success: false,
              issues: [],
              fixed: 0,
              error: error instanceof Error ? error.message : 'Unknown error'
            });
          }
        }
      }

      // Store and show results in CodeGuard Pro unified Results view
      lastResults = { results, remaining };
      await vscode.commands.executeCommand('codeguard.showResults', lastResults);

      vscode.window.showInformationMessage(
        `${category} analysis complete! Found ${remaining.length} issues.`
      );
    });
  } catch (error) {
    console.error(`Error running ${category} category:`, error);
    vscode.window.showErrorMessage(`Failed to run ${category} tools: ${error}`);
  }
}

/**
 * Undo last fix using git restore
 */
async function undoLastFix(): Promise<void> {
  try {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      vscode.window.showErrorMessage('No workspace folder found');
      return;
    }

    // Check if we're in a git repository
    const terminal = vscode.window.createTerminal('CodeGuard MCP Undo');
    terminal.sendText(`cd "${workspaceFolder.uri.fsPath}" && git status`);
    
    const choice = await vscode.window.showWarningMessage(
      'This will restore all modified files to their last git commit state. Continue?',
      'Yes, Undo',
      'Cancel'
    );

    if (choice === 'Yes, Undo') {
      terminal.sendText('git restore .');
      vscode.window.showInformationMessage('Restored files to last commit state');
    }
  } catch (error) {
    console.error('Error undoing last fix:', error);
    vscode.window.showErrorMessage(`Failed to undo: ${error}`);
  }
}

/**
 * Show last results
 */
async function showLastResults(): Promise<void> {
  if (lastResults) {
    await vscode.commands.executeCommand('codeguard.showResults', lastResults);
  } else {
    vscode.window.showInformationMessage('No results to show. Run a category first.');
  }
}

/**
 * Run all categories with AI fixes
 */
async function runAllWithAI(): Promise<void> {
  const categories = ['linting', 'testing', 'security', 'analysis', 'dependencies'];
  
  vscode.window.withProgress({
    location: vscode.ProgressLocation.Notification,
    title: 'Running all categories with AI fixes...',
    cancellable: false
  }, async (progress) => {
    const allResults: RunResult[] = [];
    const allRemaining: Issue[] = [];
    
    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      progress.report({ 
        increment: (100 / categories.length),
        message: `Running ${category}...` 
      });
      
      // Run category without showing individual results
      await runCategoryInternal(category, allResults, allRemaining);
    }
    
    // Apply AI fixes to all results
    progress.report({ message: 'Applying AI fixes...' });
    const aiFixedCount = await applyAIFixes(allResults, allRemaining);
    
    // Store and show combined results in CodeGuard Pro
    lastResults = { results: allResults, remaining: allRemaining };
    await vscode.commands.executeCommand('codeguard.showResults', lastResults);
    
    vscode.window.showInformationMessage(
      `All categories complete! Applied ${aiFixedCount} AI fixes. Found ${allRemaining.length} remaining issues.`
    );
  });
}

/**
 * Refresh MCP providers
 */
async function refreshProviders(): Promise<void> {
  vscode.window.withProgress({
    location: vscode.ProgressLocation.Notification,
    title: 'Refreshing MCP providers...',
    cancellable: false
  }, async () => {
    try {
      providers = await discover();
      treeDataProvider.refresh();
      vscode.window.showInformationMessage(`Refreshed! Found ${providers.length} MCP providers.`);
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to refresh providers: ${error}`);
    }
  });
}

/**
 * Run a specific provider
 */
async function runSpecificProvider(providerName: string): Promise<void> {
  const provider = providers.find(p => p.name === providerName);
  if (!provider) {
    vscode.window.showErrorMessage(`Provider "${providerName}" not found.`);
    return;
  }
  
  vscode.window.withProgress({
    location: vscode.ProgressLocation.Notification,
    title: `Running ${providerName}...`,
    cancellable: false
  }, async (progress) => {
    const results: RunResult[] = [];
    const remaining: Issue[] = [];
    
    for (const capability of provider.capabilities) {
      try {
        progress.report({ message: `Running ${capability.id}...` });
        
        const startTime = Date.now();
        const result = await provider.run(capability.id, capability.commands[0] || 'run', {
          workspaceRoot: vscode.workspace.workspaceFolders?.[0]?.uri.fsPath
        });
        const duration = Date.now() - startTime;

        // Create mock issues for demonstration
        const mockIssues: Issue[] = [
          {
            file: 'src/example.ts',
            line: 10,
            rule: `${capability.id}/example-rule`,
            message: `Example issue from ${capability.id}`,
            severity: 'warning'
          }
        ];

        results.push({
          tool: capability.id,
          command: capability.commands[0] || 'run',
          success: result.success,
          issues: mockIssues,
          fixed: 0,
          duration,
          output: result.message || `Executed ${capability.id}`
        });

        remaining.push(...mockIssues);

      } catch (error) {
        console.error(`Error running ${capability.id}:`, error);
        results.push({
          tool: capability.id,
          command: capability.commands[0] || 'run',
          success: false,
          issues: [],
          fixed: 0,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Store and show results in CodeGuard Pro unified Results view
    lastResults = { results, remaining };
    await vscode.commands.executeCommand('codeguard.showResults', lastResults);

    vscode.window.showInformationMessage(
      `${providerName} complete! Found ${remaining.length} issues.`
    );
  });
}

/**
 * Internal category runner that doesn't show results immediately
 */
async function runCategoryInternal(category: string, allResults: RunResult[], allRemaining: Issue[]): Promise<void> {
  const relevantProviders = providers.filter(provider => 
    provider.capabilities.some(cap => cap.category === category)
  );

  if (relevantProviders.length === 0) {
    return;
  }

  // Run each relevant provider
  for (const provider of relevantProviders) {
    const categoryCapabilities = provider.capabilities.filter(cap => cap.category === category);
    
    for (const capability of categoryCapabilities) {
      try {
        const startTime = Date.now();
        const result = await provider.run(capability.id, capability.commands[0] || 'run', {
          workspaceRoot: vscode.workspace.workspaceFolders?.[0]?.uri.fsPath
        });
        const duration = Date.now() - startTime;

        // Create mock issues for demonstration
        const mockIssues: Issue[] = [
          {
            file: 'src/example.ts',
            line: 10,
            rule: `${capability.id}/example-rule`,
            message: `Example issue from ${capability.id}`,
            severity: 'warning'
          }
        ];

        allResults.push({
          tool: capability.id,
          command: capability.commands[0] || 'run',
          success: result.success,
          issues: mockIssues,
          fixed: 0,
          duration,
          output: result.message || `Executed ${capability.id}`
        });

        allRemaining.push(...mockIssues);

      } catch (error) {
        console.error(`Error running ${capability.id}:`, error);
        allResults.push({
          tool: capability.id,
          command: capability.commands[0] || 'run',
          success: false,
          issues: [],
          fixed: 0,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }
}

/**
 * Apply AI fixes to issues (mock implementation)
 */
async function applyAIFixes(results: RunResult[], remaining: Issue[]): Promise<number> {
  // Mock AI fixes - in real implementation this would use AI to fix issues
  let fixedCount = 0;
  
  for (const result of results) {
    // Simulate fixing some issues
    const fixableIssues = result.issues.filter(issue => issue.severity === 'warning');
    const fixesToApply = Math.min(fixableIssues.length, Math.floor(Math.random() * 3) + 1);
    
    for (let i = 0; i < fixesToApply; i++) {
      if (fixableIssues[i]) {
        fixableIssues[i].fix = {
          applied: true,
          description: 'AI automatically fixed this issue'
        };
        fixedCount++;
        result.fixed++;
        
        // Remove from remaining issues
        const remainingIndex = remaining.indexOf(fixableIssues[i]);
        if (remainingIndex > -1) {
          remaining.splice(remainingIndex, 1);
        }
      }
    }
  }
  
  return fixedCount;
}

/**
 * Tree data provider for MCP sidebar
 */
class McpTreeProvider implements vscode.TreeDataProvider<McpTreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<McpTreeItem | undefined | null | void> = new vscode.EventEmitter<McpTreeItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<McpTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: McpTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: McpTreeItem): Thenable<McpTreeItem[]> {
    if (!element) {
      // Root level - show categories
      const categories = ['linting', 'testing', 'security', 'analysis', 'dependencies'];
      return Promise.resolve(categories.map(cat => new McpTreeItem(
        cat.charAt(0).toUpperCase() + cat.slice(1),
        vscode.TreeItemCollapsibleState.Collapsed,
        'category',
        cat
      )));
    }

    if (element.contextValue === 'category') {
      // Show providers for this category
      const categoryProviders = providers.filter(provider =>
        provider.capabilities.some(cap => cap.category === element.id)
      );

      return Promise.resolve(categoryProviders.map(provider => new McpTreeItem(
        provider.name,
        vscode.TreeItemCollapsibleState.None,
        'provider',
        provider.name
      )));
    }

    return Promise.resolve([]);
  }
}

class McpTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly contextValue: string,
    public readonly id: string
  ) {
    super(label, collapsibleState);
    
    if (contextValue === 'category') {
      this.command = {
        command: `codeguard-mcp.run${id.charAt(0).toUpperCase() + id.slice(1)}`,
        title: `Run ${label}`,
        arguments: []
      };
      this.iconPath = new vscode.ThemeIcon('play');
      this.tooltip = `Click to run all ${label.toLowerCase()} tools`;
    } else if (contextValue === 'provider') {
      this.command = {
        command: 'codeguard-mcp.runProvider',
        title: `Run ${label}`,
        arguments: [id]
      };
      this.iconPath = new vscode.ThemeIcon('server');
      this.tooltip = `Click to run ${label} provider`;
    }
  }
}

export function deactivate() {
  console.log('CodeGuard MCP extension deactivated');
}
