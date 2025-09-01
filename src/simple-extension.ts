import * as vscode from "vscode";
import { QualityHubSidebarProvider } from "./ui/QualityHubSidebarProvider";
import { discover } from './mcpDiscovery';
import { planCategory } from './categoryPlanner';
import { runCategoryPlan, RunResult } from './dispatcher';
import { showResults } from './resultsView';
import { registerResultsViewProvider, updateResultsView } from './ui/ResultsViewProvider';
import { applyAIFixes } from './aiFixer';
import { runLocal } from './localTools';
import { normalize } from './normalizers';

// Helper function to run MCP category with quick pick tool selection
async function runMCPCategoryWithQuickPick(category: string): Promise<void> {
  try {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      vscode.window.showWarningMessage("CodeGuard: No workspace folder open");
      return;
    }
    const cwd = workspaceFolders[0].uri.fsPath;

    // Discover MCP providers
    const providers = await discover();
    
    // Get all available tools for this category
    const plan = planCategory(providers, category, cwd, ["*"]);
    const availableTools = plan.map(req => ({
      label: req.tool,
      description: req.command,
      picked: true // Default all tools as selected
    }));

    if (availableTools.length === 0) {
      vscode.window.showInformationMessage(`No MCP tools discovered for ${category} category`);
      return;
    }

    // Show quick pick with multi-select
    const selectedTools = await vscode.window.showQuickPick(availableTools, {
      canPickMany: true,
      placeHolder: `Select ${category} tools to run (multiple selection allowed)`,
      title: `CodeGuard MCP - ${category.charAt(0).toUpperCase() + category.slice(1)} Tools`
    });

    if (!selectedTools || selectedTools.length === 0) {
      return; // User cancelled or selected nothing
    }

    // Create overridden enabled IDs list
    const enabledIds = selectedTools.map(tool => tool.label);

    // Read AI settings
    const config = vscode.workspace.getConfiguration("codeguard");
    const aiEnabled = config.get<boolean>("ai.enabled") || true;
    const aiMode = config.get<"safe-only" | "suggest" | "off">("ai.mode") || "safe-only";

    // Build execution plan with selected tools only
    const selectedPlan = planCategory(providers, category, cwd, enabledIds);
    
    // Execute plan
    const results = await runCategoryPlan(selectedPlan);
    
    // Apply AI fixes if enabled
    let finalResults = results;
    let remaining: any[] = [];
    
    if (aiEnabled) {
      const aiResult = await applyAIFixes(results, cwd, aiMode);
      finalResults = aiResult.results;
      remaining = aiResult.remaining;
    }
    
    // Update persistent results view
    updateResultsView({ results: finalResults, remaining });
    
  } catch (error) {
    const message = `CodeGuard ${category} quick pick failed: ${error instanceof Error ? error.message : String(error)}`;
    vscode.window.showErrorMessage(message);
    console.error(`CodeGuard ${category} quick pick error:`, error);
  }
}

// Helper function to run terminal commands
function runToolCommand(toolName: string, command: string): void {
  const terminal = vscode.window.createTerminal(`CodeGuard Pro - ${toolName}`);
  terminal.show();
  terminal.sendText(command);
}

// Setup and register the sidebar provider
function setupSidebarProvider(context: vscode.ExtensionContext): QualityHubSidebarProvider {
  const sidebarProvider = new QualityHubSidebarProvider(context);

  // Register the sidebar webview provider
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider("quality-hub.sidebarView", sidebarProvider),
  );

  // Register webview focus command
  context.subscriptions.push(
    vscode.commands.registerCommand("quality-hub.focusWebview", () => {
      vscode.commands.executeCommand("quality-hub.sidebarView.focus");
    }),
  );

  return sidebarProvider;
}

// Register essential extension commands
function registerEssentialCommands(): vscode.Disposable[] {
  return [
    vscode.commands.registerCommand("quality-hub.showSimple", () => {
      console.log("Opening Quality Hub webview...");
      vscode.commands.executeCommand("workbench.view.extension.quality-hub-webview");
      setTimeout(() => {
        vscode.commands.executeCommand("quality-hub.sidebarView.focus");
      }, 100);
    }),

    // Aliases with CodeGuard prefix for forward compatibility
    vscode.commands.registerCommand("codeguard.sidebarView.focus", () => {
      vscode.commands.executeCommand("quality-hub.sidebarView.focus");
    }),
    vscode.commands.registerCommand("codeguard.show", () => {
      vscode.commands.executeCommand("workbench.view.extension.quality-hub-webview");
      setTimeout(() => vscode.commands.executeCommand("quality-hub.sidebarView.focus"), 100);
    }),
    vscode.commands.registerCommand("codeguard.openSettings", () => {
      vscode.commands.executeCommand("workbench.action.openSettings", "quality-hub");
    }),

    // MCP/Local split commands for webview UI
    vscode.commands.registerCommand('codeguard.runTool.local', (toolId: string) => runLocalTool(String(toolId))),
    vscode.commands.registerCommand('codeguard.runTool.mcp', (toolId: string, category?: string) => runMcpTool(String(toolId), category)),
    vscode.commands.registerCommand('codeguard.runCategory.linting.local', () => runLocalCategory('linting')),
    vscode.commands.registerCommand('codeguard.runCategory.testing.local', () => runLocalCategory('testing')),
    vscode.commands.registerCommand('codeguard.runCategory.security.local', () => runLocalCategory('security')),
    vscode.commands.registerCommand('codeguard.runCategory.analysis.local', () => runLocalCategory('analysis')),
    vscode.commands.registerCommand('codeguard.runCategory.dependencies.local', () => runLocalCategory('dependencies')),

    vscode.commands.registerCommand("quality-hub.openSettings", () => {
      vscode.commands.executeCommand("workbench.action.openSettings", "quality-hub");
    }),

    vscode.commands.registerCommand("quality-hub.test", () => {
      vscode.window.showInformationMessage("CodeGuard Pro extension is working!");
    }),

    vscode.commands.registerCommand("codeguard.undoLastFix", async () => {
      try {
        // Check if we're in a Git workspace
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
          vscode.window.showWarningMessage("CodeGuard: No workspace folder open");
          return;
        }

        const workspaceRoot = workspaceFolders[0].uri.fsPath;

        // Check if this is a Git repository
        const { exec } = require('child_process');
        const { promisify } = require('util');
        const execAsync = promisify(exec);

        try {
          // Test if git is available and this is a git repo
          await execAsync('git rev-parse --git-dir', { cwd: workspaceRoot });
          
          // Try modern git restore command first, fallback to older checkout
          try {
            await execAsync('git restore .', { cwd: workspaceRoot });
          } catch (restoreError) {
            // Fallback to older git checkout for compatibility
            await execAsync('git checkout -- .', { cwd: workspaceRoot });
          }
          
          vscode.window.showInformationMessage("CodeGuard: Successfully reverted unstaged changes");
          
        } catch (gitError) {
          vscode.window.showWarningMessage("CodeGuard: Undo requires a Git workspace");
        }

      } catch (error) {
        const message = `CodeGuard undo failed: ${error instanceof Error ? error.message : String(error)}`;
        vscode.window.showErrorMessage(message);
        console.error('CodeGuard undo error:', error);
      }
    }),

    // MCP Category Commands
    vscode.commands.registerCommand("codeguard.runCategory.linting", async () => {
      try {
        // Get current working directory from workspace
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
          vscode.window.showWarningMessage("CodeGuard: No workspace folder open");
          return;
        }
        const cwd = workspaceFolders[0].uri.fsPath;

        // Read settings
        const config = vscode.workspace.getConfiguration("codeguard");
        const enabledIds = config.get<string[]>("category.linting.tools") || ["*"];
        const aiEnabled = config.get<boolean>("ai.enabled") || true;
        const aiMode = config.get<"safe-only" | "suggest" | "off">("ai.mode") || "safe-only";

        // Discover MCP providers
        const providers = await discover();
        
        // Build execution plan
        const plan = planCategory(providers, "linting", cwd, enabledIds);
        
        // Execute plan
        const results = await runCategoryPlan(plan);
        
        // Apply AI fixes if enabled
        let finalResults = results;
        let remaining: any[] = [];
        
        if (aiEnabled) {
          const aiResult = await applyAIFixes(results, cwd, aiMode);
          finalResults = aiResult.results;
          remaining = aiResult.remaining;
        }
        
        // Update persistent results view
        updateResultsView({ results: finalResults, remaining });
        
      } catch (error) {
        const message = `CodeGuard linting failed: ${error instanceof Error ? error.message : String(error)}`;
        vscode.window.showErrorMessage(message);
        console.error('CodeGuard linting error:', error);
      }
    }),

    vscode.commands.registerCommand("codeguard.runCategory.testing", async () => {
      try {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
          vscode.window.showWarningMessage("CodeGuard: No workspace folder open");
          return;
        }
        const cwd = workspaceFolders[0].uri.fsPath;

        const config = vscode.workspace.getConfiguration("codeguard");
        const enabledIds = config.get<string[]>("category.testing.tools") || ["*"];
        const aiEnabled = config.get<boolean>("ai.enabled") || true;
        const aiMode = config.get<"safe-only" | "suggest" | "off">("ai.mode") || "safe-only";

        const providers = await discover();
        const plan = planCategory(providers, "testing", cwd, enabledIds);
        const results = await runCategoryPlan(plan);
        
        let finalResults = results;
        let remaining: any[] = [];
        
        if (aiEnabled) {
          const aiResult = await applyAIFixes(results, cwd, aiMode);
          finalResults = aiResult.results;
          remaining = aiResult.remaining;
        }
        
        updateResultsView({ results: finalResults, remaining });
        
      } catch (error) {
        const message = `CodeGuard testing failed: ${error instanceof Error ? error.message : String(error)}`;
        vscode.window.showErrorMessage(message);
        console.error('CodeGuard testing error:', error);
      }
    }),

    vscode.commands.registerCommand("codeguard.runCategory.security", async () => {
      try {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
          vscode.window.showWarningMessage("CodeGuard: No workspace folder open");
          return;
        }
        const cwd = workspaceFolders[0].uri.fsPath;

        const config = vscode.workspace.getConfiguration("codeguard");
        const enabledIds = config.get<string[]>("category.security.tools") || ["*"];
        const aiEnabled = config.get<boolean>("ai.enabled") || true;
        const aiMode = config.get<"safe-only" | "suggest" | "off">("ai.mode") || "safe-only";

        const providers = await discover();
        const plan = planCategory(providers, "security", cwd, enabledIds);
        const results = await runCategoryPlan(plan);
        
        let finalResults = results;
        let remaining: any[] = [];
        
        if (aiEnabled) {
          const aiResult = await applyAIFixes(results, cwd, aiMode);
          finalResults = aiResult.results;
          remaining = aiResult.remaining;
        }
        
        updateResultsView({ results: finalResults, remaining });
        
      } catch (error) {
        const message = `CodeGuard security failed: ${error instanceof Error ? error.message : String(error)}`;
        vscode.window.showErrorMessage(message);
        console.error('CodeGuard security error:', error);
      }
    }),

    vscode.commands.registerCommand("codeguard.runCategory.analysis", async () => {
      try {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
          vscode.window.showWarningMessage("CodeGuard: No workspace folder open");
          return;
        }
        const cwd = workspaceFolders[0].uri.fsPath;

        const config = vscode.workspace.getConfiguration("codeguard");
        const enabledIds = config.get<string[]>("category.analysis.tools") || ["*"];
        const aiEnabled = config.get<boolean>("ai.enabled") || true;
        const aiMode = config.get<"safe-only" | "suggest" | "off">("ai.mode") || "safe-only";

        const providers = await discover();
        const plan = planCategory(providers, "analysis", cwd, enabledIds);
        const results = await runCategoryPlan(plan);
        
        let finalResults = results;
        let remaining: any[] = [];
        
        if (aiEnabled) {
          const aiResult = await applyAIFixes(results, cwd, aiMode);
          finalResults = aiResult.results;
          remaining = aiResult.remaining;
        }
        
        updateResultsView({ results: finalResults, remaining });
        
      } catch (error) {
        const message = `CodeGuard analysis failed: ${error instanceof Error ? error.message : String(error)}`;
        vscode.window.showErrorMessage(message);
        console.error('CodeGuard analysis error:', error);
      }
    }),

    vscode.commands.registerCommand("codeguard.runCategory.dependencies", async () => {
      try {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
          vscode.window.showWarningMessage("CodeGuard: No workspace folder open");
          return;
        }
        const cwd = workspaceFolders[0].uri.fsPath;

        const config = vscode.workspace.getConfiguration("codeguard");
        const enabledIds = config.get<string[]>("category.dependencies.tools") || ["*"];
        const aiEnabled = config.get<boolean>("ai.enabled") || true;
        const aiMode = config.get<"safe-only" | "suggest" | "off">("ai.mode") || "safe-only";

        const providers = await discover();
        const plan = planCategory(providers, "dependencies", cwd, enabledIds);
        const results = await runCategoryPlan(plan);
        
        let finalResults = results;
        let remaining: any[] = [];
        
        if (aiEnabled) {
          const aiResult = await applyAIFixes(results, cwd, aiMode);
          finalResults = aiResult.results;
          remaining = aiResult.remaining;
        }
        
        updateResultsView({ results: finalResults, remaining });
        
      } catch (error) {
        const message = `CodeGuard dependencies failed: ${error instanceof Error ? error.message : String(error)}`;
        vscode.window.showErrorMessage(message);
        console.error('CodeGuard dependencies error:', error);
      }
    }),

    // MCP Quick Pick Commands (Alt+click)
    vscode.commands.registerCommand("codeguard.runCategory.linting.quickPick", () => runMCPCategoryWithQuickPick("linting")),
    vscode.commands.registerCommand("codeguard.runCategory.testing.quickPick", () => runMCPCategoryWithQuickPick("testing")),
    vscode.commands.registerCommand("codeguard.runCategory.security.quickPick", () => runMCPCategoryWithQuickPick("security")),
    vscode.commands.registerCommand("codeguard.runCategory.analysis.quickPick", () => runMCPCategoryWithQuickPick("analysis")),
    vscode.commands.registerCommand("codeguard.runCategory.dependencies.quickPick", () => runMCPCategoryWithQuickPick("dependencies")),
  ];
}

// Register linting and formatting tool commands
function registerLintingCommands(): vscode.Disposable[] {
  return [
    vscode.commands.registerCommand("quality-hub.eslintCode", () => {
      runToolCommand("ESLint", "npx eslint . --ext .ts,.js,.tsx,.jsx --fix");
    }),

    vscode.commands.registerCommand("quality-hub.biomeCode", () => {
      runToolCommand("Biome", "npx @biomejs/biome check --apply .");
    }),

    vscode.commands.registerCommand("quality-hub.typescriptEslint", () => {
      runToolCommand(
        "TypeScript ESLint",
        "npx eslint . --ext .ts,.tsx --parser @typescript-eslint/parser",
      );
    }),

    vscode.commands.registerCommand("quality-hub.prettier", () => {
      runToolCommand("Prettier", "npx prettier --write .");
    }),

    vscode.commands.registerCommand("quality-hub.standardjs", () => {
      runToolCommand("StandardJS", "npx standard --fix");
    }),
  ];
}

// Register security scanning tool commands
function registerSecurityCommands(): vscode.Disposable[] {
  return [
    vscode.commands.registerCommand("quality-hub.npmAudit", () => {
      runToolCommand("npm audit", "npm audit --audit-level moderate");
    }),

    vscode.commands.registerCommand("quality-hub.eslintSecurity", () => {
      runToolCommand(
        "ESLint Security",
        "npx eslint . --ext .js,.ts --plugin=security",
      );
    }),

    vscode.commands.registerCommand("quality-hub.retireJs", () => {
      runToolCommand("Retire.js", "npx retire --js");
    }),

    vscode.commands.registerCommand("quality-hub.auditCi", () => {
      runToolCommand("audit-ci", "npx audit-ci");
    }),

    vscode.commands.registerCommand("quality-hub.owaspCheck", () => {
      runToolCommand(
        "OWASP Dependency Check",
        "npx owasp-dependency-check --project . --format ALL",
      );
    }),
  ];
}

// Register testing framework commands
function registerTestingCommands(): vscode.Disposable[] {
  return [
    vscode.commands.registerCommand("quality-hub.playwright", () => {
      runToolCommand("Playwright", "npx playwright test");
    }),

    vscode.commands.registerCommand("quality-hub.cypress", () => {
      runToolCommand("Cypress", "npx cypress run");
    }),

    vscode.commands.registerCommand("quality-hub.jest", () => {
      runToolCommand("Jest", "npx jest");
    }),

    vscode.commands.registerCommand("quality-hub.mocha", () => {
      runToolCommand("Mocha", "npx mocha");
    }),

    vscode.commands.registerCommand("quality-hub.vitest", () => {
      runToolCommand("Vitest", "npx vitest run");
    }),

    vscode.commands.registerCommand("quality-hub.webdriverio", () => {
      runToolCommand("WebdriverIO", "npx wdio run");
    }),
  ];
}

// Register code analysis tool commands
function registerAnalysisCommands(): vscode.Disposable[] {
  return [
    vscode.commands.registerCommand("quality-hub.sonarJs", () => {
      runToolCommand("SonarJS", "npx eslint . --ext .js,.ts");
    }),

    vscode.commands.registerCommand("quality-hub.plato", () => {
      runToolCommand("Plato", "npx plato -r -d plato-report .");
    }),

    vscode.commands.registerCommand("quality-hub.eslintComplexity", () => {
      runToolCommand(
        "ESLint Complexity",
        "npx eslint . --ext .js,.ts --rule 'complexity: [error, 10]'",
      );
    }),

    vscode.commands.registerCommand("quality-hub.duplicateCode", () => {
      runToolCommand("Duplicate Code Detection", "npx jscpd .");
    }),

    vscode.commands.registerCommand("quality-hub.codeStructure", () => {
      const cmd = "node -e \"const fs=require('fs'),p=require('path');function* w(d){for(const f of fs.readdirSync(d,{withFileTypes:true})){const q=p.join(d,f.name);if(f.isDirectory()) for(const x of w(q)) yield x; else if(/\\.(ts|js)$/.test(f.name)) yield q;}}console.log(Array.from(w('src')).slice(0,20).join('\\n'))\"";
      runToolCommand("Code Structure Analysis", cmd);
    }),
  ];
}

// Register dependency management commands
function registerDependencyCommands(): vscode.Disposable[] {
  return [
    vscode.commands.registerCommand("quality-hub.madgeDeps", () => {
      runToolCommand("Madge Dependencies", "npx madge --circular --extensions ts,js .");
    }),

    vscode.commands.registerCommand("quality-hub.depcheck", () => {
      runToolCommand("Depcheck", "npx depcheck");
    }),

    vscode.commands.registerCommand("quality-hub.updateDependencies", () => {
      runToolCommand("Update Dependencies", "npx npm-check-updates");
    }),
  ];
}

// Register API integration commands
function registerApiCommands(): vscode.Disposable[] {
  return [
    vscode.commands.registerCommand("quality-hub.sonarQubeApi", () => {
      vscode.window.showInformationMessage("SonarQube API integration - Configure in settings");
    }),

    vscode.commands.registerCommand("quality-hub.codacyApi", () => {
      vscode.window.showInformationMessage("Codacy API integration - Configure in settings");
    }),

    vscode.commands.registerCommand("quality-hub.codeClimateApi", () => {
      vscode.window.showInformationMessage("CodeClimate API integration - Configure in settings");
    }),

    vscode.commands.registerCommand("quality-hub.snykCodeApi", () => {
      vscode.window.showInformationMessage("Snyk Code API integration - Configure in settings");
    }),

    vscode.commands.registerCommand("quality-hub.codeFactorApi", () => {
      vscode.window.showInformationMessage("CodeFactor API integration - Configure in settings");
    }),
  ];
}

// Finalize activation by registering all commands and showing success message
function finalizeActivation(context: vscode.ExtensionContext, commands: vscode.Disposable[]): void {
  context.subscriptions.push(...commands);

  console.log("CodeGuard Pro: Extension activated successfully!");
  vscode.window.showInformationMessage(
    "CodeGuard Pro activated! Click the shield icon in the Activity Bar.",
  );
}

export function activate(context: vscode.ExtensionContext): void {
  console.log("CodeGuard Pro: Starting activation...");

  try {
    // Setup sidebar provider and persistent results view
    setupSidebarProvider(context);
    registerResultsViewProvider(context);

    // Register all command categories
    const allCommands = [
      ...registerEssentialCommands(),
      ...registerLintingCommands(),
      ...registerSecurityCommands(),
      ...registerTestingCommands(),
      ...registerAnalysisCommands(),
      ...registerDependencyCommands(),
      ...registerApiCommands(),
    ];

    // Expose results update command for external callers (e.g., MCP extension)
    context.subscriptions.push(
      vscode.commands.registerCommand('codeguard.showResults', (model: any) => {
        try { updateResultsView(model); } catch (e) { console.error('showResults command error', e); }
      })
    );

    // Finalize activation
    finalizeActivation(context, allCommands);
  } catch (error) {
    console.error("CodeGuard Pro: Failed to activate extension:", error);
    vscode.window.showErrorMessage(`CodeGuard Pro activation failed: ${String(error)}`);
  }
}

// Helper: map categories to local tool IDs supported by local runner
function getLocalToolIdsForCategory(category: string): string[] {
  switch (category) {
    case 'linting':
      return ['eslint', 'biome', 'prettier', 'tsc'];
    case 'testing':
      return ['jest', 'mocha', 'vitest'];
    case 'security':
      return ['audit', 'retirejs'];
    case 'analysis':
      return ['madge'];
    case 'dependencies':
      return ['depcheck'];
    default:
      return [];
  }
}

// Run a single local tool and push results to the Results view
async function runLocalTool(toolId: string): Promise<void> {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    vscode.window.showWarningMessage("CodeGuard: No workspace folder open");
    return;
  }
  const cwd = workspaceFolders[0].uri.fsPath;

  const start = Date.now();
  try {
    const raw = await runLocal(toolId, {}, cwd);
    const issues = normalize(toolId, raw);
    const fixed = issues.filter(i => i.fix?.applied).length;

    const results: RunResult[] = [{
      tool: toolId,
      command: toolId,
      success: true,
      issues,
      issueCount: issues.length,
      fixed,
      duration: Date.now() - start,
      backend: 'IDE' as const,
      output: 'Local execution'
    }];

    const config = vscode.workspace.getConfiguration("codeguard");
    const aiEnabled = config.get<boolean>("ai.enabled") || true;
    const aiMode = config.get<"safe-only" | "suggest" | "off">("ai.mode") || "safe-only";

    let finalResults: RunResult[] = results;
    let remaining: any[] = [];
    if (aiEnabled) {
      const aiResult = await applyAIFixes(results, cwd, aiMode);
      finalResults = aiResult.results;
      remaining = aiResult.remaining;
    }
    updateResultsView({ results: finalResults, remaining });
  } catch (error) {
    updateResultsView({
      results: [{
        tool: toolId,
        command: toolId,
        success: false,
        issues: [],
        issueCount: 0,
        fixed: 0,
        duration: Date.now() - start,
        backend: 'IDE',
        error: error instanceof Error ? error.message : String(error)
      }],
      remaining: []
    });
  }
}

// Run all local tools for a category
async function runLocalCategory(category: string): Promise<void> {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    vscode.window.showWarningMessage("CodeGuard: No workspace folder open");
    return;
  }
  const cwd = workspaceFolders[0].uri.fsPath;

  const toolIds = getLocalToolIdsForCategory(category);
  const results: RunResult[] = [];

  for (const toolId of toolIds) {
    const start = Date.now();
    try {
      const raw = await runLocal(toolId, {}, cwd);
      const issues = normalize(toolId, raw);
      const fixed = issues.filter(i => i.fix?.applied).length;
      results.push({
        tool: toolId,
        command: toolId,
        success: true,
        issues,
        issueCount: issues.length,
        fixed,
        duration: Date.now() - start,
        backend: 'IDE' as const,
        output: 'Local execution'
      });
    } catch (error) {
      results.push({
        tool: toolId,
        command: toolId,
        success: false,
        issues: [],
        issueCount: 0,
        fixed: 0,
        duration: Date.now() - start,
        backend: 'IDE' as const,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  const config = vscode.workspace.getConfiguration("codeguard");
  const aiEnabled = config.get<boolean>("ai.enabled") || true;
  const aiMode = config.get<"safe-only" | "suggest" | "off">("ai.mode") || "safe-only";

  let finalResults = results;
  let remaining: any[] = [];
  if (aiEnabled) {
    const aiResult = await applyAIFixes(results, cwd, aiMode);
    finalResults = aiResult.results;
    remaining = aiResult.remaining;
  }
  updateResultsView({ results: finalResults, remaining });
}

// Run a single MCP tool (by id) within a category
async function runMcpTool(toolId: string, category?: string): Promise<void> {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    vscode.window.showWarningMessage("CodeGuard: No workspace folder open");
    return;
  }
  const cwd = workspaceFolders[0].uri.fsPath;
  const cat = category || 'analysis';
  try {
    const providers = await discover();
    const plan = planCategory(providers, cat, cwd, [toolId]);
    const results = await runCategoryPlan(plan);

    const config = vscode.workspace.getConfiguration("codeguard");
    const aiEnabled = config.get<boolean>("ai.enabled") || true;
    const aiMode = config.get<"safe-only" | "suggest" | "off">("ai.mode") || "safe-only";
    let finalResults = results;
    let remaining: any[] = [];
    if (aiEnabled) {
      const aiResult = await applyAIFixes(results, cwd, aiMode);
      finalResults = aiResult.results;
      remaining = aiResult.remaining;
    }
    updateResultsView({ results: finalResults, remaining });
  } catch (error) {
    vscode.window.showErrorMessage(`CodeGuard MCP tool failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function deactivate(): void {
  console.log("CodeGuard Pro: Extension deactivated");
}



