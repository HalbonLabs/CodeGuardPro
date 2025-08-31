/**
 * Results View Service
 * Displays execution results in a dedicated webview panel
 */

import * as vscode from 'vscode';
import { RunResult } from './dispatcher';

export interface Issue {
  file: string;
  line: number;
  rule: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  fix?: {
    applied: boolean;
    description?: string;
  };
}

export interface ResultsModel {
  results: RunResult[];
  remaining: Issue[];
}

let currentPanel: vscode.WebviewPanel | undefined;

/**
 * Shows execution results in a webview panel
 */
export async function showResults(model: ResultsModel): Promise<void> {
  const { results, remaining } = model;

  // Create or reveal the webview panel
  if (currentPanel) {
    currentPanel.reveal(vscode.ViewColumn.Two);
  } else {
    currentPanel = vscode.window.createWebviewPanel(
      'codeguardResults',
      'CodeGuard Results',
      vscode.ViewColumn.Two,
      {
        enableScripts: true,
        localResourceRoots: [],
        retainContextWhenHidden: true
      }
    );

    // Handle panel disposal
    currentPanel.onDidDispose(() => {
      currentPanel = undefined;
    });

    // Handle messages from webview
    currentPanel.webview.onDidReceiveMessage(
      message => {
        switch (message.command) {
          case 'undoLastFix':
            vscode.commands.executeCommand('codeguard.undoLastFix');
            break;
          case 'refreshResults':
            // TODO: Implement results refresh
            break;
        }
      }
    );
  }

  // Generate and set HTML content
  currentPanel.webview.html = generateResultsHtml(results, remaining);
}

function generateResultsHtml(results: RunResult[], remaining: Issue[]): string {
  // Calculate summary statistics
  const autoFixedCount = results.reduce((total, result) => {
    // TODO: Update RunResult to include detailed issues array
    // For now, use the 'fixed' count as approximation
    return total + (result.fixed || 0);
  }, 0);

  const remainingCount = remaining.length;
  const totalDuration = results.reduce((total, result) => {
    // TODO: Add duration field to RunResult
    return total + (result.duration || 0);
  }, 0);

  // Extract auto-fixed issues from results
  const autoFixedIssues = extractAutoFixedIssues(results);
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CodeGuard Results</title>
        <style>
            body {
                font-family: var(--vscode-font-family);
                background-color: var(--vscode-editor-background);
                color: var(--vscode-editor-foreground);
                margin: 0;
                padding: 20px;
                line-height: 1.5;
            }
            
            .header {
                display: flex;
                gap: 16px;
                margin-bottom: 24px;
                padding-bottom: 16px;
                border-bottom: 1px solid var(--vscode-panel-border);
            }
            
            .badge {
                padding: 8px 16px;
                border-radius: 16px;
                font-weight: 600;
                font-size: 0.9em;
                text-align: center;
                min-width: 80px;
            }
            
            .badge-success {
                background-color: var(--vscode-testing-iconPassed);
                color: var(--vscode-editor-background);
            }
            
            .badge-warning {
                background-color: var(--vscode-testing-iconFailed);
                color: var(--vscode-editor-background);
            }
            
            .badge-info {
                background-color: var(--vscode-button-secondaryBackground);
                color: var(--vscode-button-secondaryForeground);
            }
            
            .section {
                margin-bottom: 32px;
            }
            
            .section-title {
                font-size: 1.2em;
                font-weight: 600;
                margin-bottom: 16px;
                padding-bottom: 8px;
                border-bottom: 1px solid var(--vscode-panel-border);
            }
            
            .tool-group {
                margin-bottom: 24px;
                padding: 16px;
                border: 1px solid var(--vscode-panel-border);
                border-radius: 8px;
                background-color: var(--vscode-sideBar-background);
            }
            
            .tool-name {
                font-weight: 600;
                color: var(--vscode-symbolIcon-functionForeground);
                margin-bottom: 12px;
                font-size: 1.1em;
            }
            
            .issue-item {
                margin: 8px 0;
                padding: 8px 12px;
                border-left: 3px solid var(--vscode-panel-border);
                background-color: var(--vscode-editor-background);
                border-radius: 4px;
            }
            
            .issue-fixed {
                border-left-color: var(--vscode-testing-iconPassed);
            }
            
            .issue-remaining {
                border-left-color: var(--vscode-testing-iconFailed);
            }
            
            .issue-location {
                font-family: var(--vscode-editor-font-family);
                font-size: 0.9em;
                color: var(--vscode-descriptionForeground);
                margin-bottom: 4px;
            }
            
            .issue-rule {
                color: var(--vscode-symbolIcon-keywordForeground);
                font-weight: 500;
                font-size: 0.85em;
            }
            
            .issue-message {
                margin-top: 4px;
                font-size: 0.9em;
            }
            
            .action-buttons {
                margin-top: 24px;
                display: flex;
                gap: 12px;
            }
            
            .btn {
                padding: 8px 16px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 0.9em;
                font-weight: 500;
                transition: background-color 0.2s;
            }
            
            .btn-secondary {
                background-color: var(--vscode-button-secondaryBackground);
                color: var(--vscode-button-secondaryForeground);
            }
            
            .btn-secondary:hover {
                background-color: var(--vscode-button-secondaryHoverBackground);
            }
            
            .empty-state {
                text-align: center;
                color: var(--vscode-descriptionForeground);
                font-style: italic;
                padding: 24px;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="badge badge-success">
                ✅ ${autoFixedCount} Auto-fixed
            </div>
            <div class="badge badge-warning">
                ⚠️ ${remainingCount} Remaining
            </div>
            <div class="badge badge-info">
                ⏱️ ${formatDuration(totalDuration)}
            </div>
        </div>

        <div class="section">
            <h2 class="section-title">🔧 Auto-fixed Issues</h2>
            ${generateAutoFixedSection(autoFixedIssues)}
        </div>

        <div class="section">
            <h2 class="section-title">👀 Needs Review</h2>
            ${generateRemainingSection(remaining)}
        </div>

        <div class="action-buttons">
            <button class="btn btn-secondary" onclick="undoLastFix()">
                ↶ Undo Last Fix
            </button>
            <button class="btn btn-secondary" onclick="refreshResults()">
                🔄 Refresh Results
            </button>
        </div>

        <script>
            const vscode = acquireVsCodeApi();

            function undoLastFix() {
                vscode.postMessage({
                    command: 'undoLastFix'
                });
            }

            function refreshResults() {
                vscode.postMessage({
                    command: 'refreshResults'
                });
            }
        </script>
    </body>
    </html>
  `;
}

function extractAutoFixedIssues(results: RunResult[]): Record<string, Issue[]> {
  const autoFixed: Record<string, Issue[]> = {};

  for (const result of results) {
    // TODO: Update RunResult interface to include detailed issues
    // For now, create placeholder issues based on the fixed count
    if (result.fixed && result.fixed > 0) {
      autoFixed[result.tool] = Array.from({ length: result.fixed }, (_, i) => ({
        file: 'placeholder.ts', // TODO: Get actual file from result
        line: i + 1,
        rule: 'auto-fix-rule',
        message: `Auto-fixed issue ${i + 1}`,
        severity: 'warning' as const,
        fix: {
          applied: true,
          description: `Fixed by ${result.tool}`
        }
      }));
    }
  }

  return autoFixed;
}

function generateAutoFixedSection(autoFixedByTool: Record<string, Issue[]>): string {
  const tools = Object.keys(autoFixedByTool);
  
  if (tools.length === 0) {
    return '<div class="empty-state">No auto-fixes were applied</div>';
  }

  return tools.map(tool => {
    const issues = autoFixedByTool[tool];
    const issueItems = issues.map(issue => `
      <div class="issue-item issue-fixed">
        <div class="issue-location">${issue.file}:${issue.line}</div>
        <div class="issue-rule">${issue.rule}</div>
        <div class="issue-message">${issue.message}</div>
      </div>
    `).join('');

    return `
      <div class="tool-group">
        <div class="tool-name">${tool} (${issues.length} fixes)</div>
        ${issueItems}
      </div>
    `;
  }).join('');
}

function generateRemainingSection(remaining: Issue[]): string {
  if (remaining.length === 0) {
    return '<div class="empty-state">🎉 No remaining issues to review!</div>';
  }

  // Group by tool (inferred from rule prefix or manual grouping)
  const byTool: Record<string, Issue[]> = {};
  
  for (const issue of remaining) {
    const tool = inferToolFromRule(issue.rule);
    if (!byTool[tool]) {
      byTool[tool] = [];
    }
    byTool[tool].push(issue);
  }

  return Object.keys(byTool).map(tool => {
    const issues = byTool[tool];
    const issueItems = issues.map(issue => `
      <div class="issue-item issue-remaining">
        <div class="issue-location">${issue.file}:${issue.line}</div>
        <div class="issue-rule">${issue.rule}</div>
        <div class="issue-message">${issue.message}</div>
      </div>
    `).join('');

    return `
      <div class="tool-group">
        <div class="tool-name">${tool} (${issues.length} issues)</div>
        ${issueItems}
      </div>
    `;
  }).join('');
}

function inferToolFromRule(rule: string): string {
  // Simple heuristic to group issues by tool based on rule name
  if (rule.startsWith('@typescript-eslint/')) return 'TypeScript ESLint';
  if (rule.startsWith('eslint-')) return 'ESLint';
  if (rule.includes('biome')) return 'Biome';
  if (rule.includes('prettier')) return 'Prettier';
  return 'Other';
}

function formatDuration(milliseconds: number): string {
  if (milliseconds < 1000) {
    return `${milliseconds}ms`;
  }
  
  const seconds = Math.round(milliseconds / 1000);
  if (seconds < 60) {
    return `${seconds}s`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}
