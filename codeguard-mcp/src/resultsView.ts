/**
 * Results View Service for CodeGuard MCP
 * Displays execution results in a dedicated webview panel
 */

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

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
  aiSuggestion?: string;
}

export interface RunResult {
  tool: string;
  command: string;
  success: boolean;
  issues: Issue[];
  fixed: number;
  duration?: number;
  output?: string;
  error?: string;
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
      'codeguardMcpResults',
      'CodeGuard MCP Results',
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
            vscode.commands.executeCommand('codeguard-mcp.undoLastFix');
            break;
          case 'openFile':
            const uri = vscode.Uri.file(message.filePath);
            vscode.commands.executeCommand('vscode.open', uri, {
              selection: new vscode.Range(
                message.line - 1,
                0,
                message.line - 1,
                0
              )
            });
            break;
          case 'exportJSON':
            exportResultsToJSON(model);
            break;
        }
      }
    );
  }

  // Generate and set HTML content
  currentPanel.webview.html = generateResultsHtml(results, remaining);
}

async function exportResultsToJSON(model: ResultsModel): Promise<void> {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `codeguard-mcp-results-${timestamp}.json`;
    const tempDir = os.tmpdir();
    const filePath = path.join(tempDir, filename);

    const exportData = {
      timestamp: new Date().toISOString(),
      summary: {
        autoFixedCount: model.results.reduce((total, result) => total + (result.fixed || 0), 0),
        remainingCount: model.remaining.length,
        totalDuration: model.results.reduce((total, result) => total + (result.duration || 0), 0)
      },
      results: model.results,
      remaining: model.remaining
    };

    await fs.promises.writeFile(filePath, JSON.stringify(exportData, null, 2), 'utf8');
    
    vscode.window.showInformationMessage(
      `Results exported to: ${filePath}`,
      'Open File'
    ).then(selection => {
      if (selection === 'Open File') {
        vscode.commands.executeCommand('vscode.open', vscode.Uri.file(filePath));
      }
    });
  } catch (error) {
    vscode.window.showErrorMessage(`Failed to export results: ${error}`);
  }
}

function generateResultsHtml(results: RunResult[], remaining: Issue[]): string {
  const autoFixedCount = results.reduce((total, result) => total + (result.fixed || 0), 0);
  const remainingCount = remaining.length;
  const totalDuration = results.reduce((total, result) => total + (result.duration || 0), 0);

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CodeGuard MCP Results</title>
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
                flex-wrap: wrap;
            }
            
            .badge {
                padding: 8px 16px;
                border-radius: 16px;
                font-weight: 600;
                font-size: 0.9em;
                text-align: center;
                min-width: 80px;
                white-space: nowrap;
            }
            
            .badge-success {
                background-color: #4caf50;
                color: white;
            }
            
            .badge-warning {
                background-color: #ff9800;
                color: white;
            }
            
            .badge-info {
                background-color: #2196f3;
                color: white;
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
                border-left-color: #4caf50;
            }
            
            .issue-remaining {
                border-left-color: #ff9800;
            }
            
            .issue-location {
                font-family: var(--vscode-editor-font-family);
                font-size: 0.9em;
                color: var(--vscode-descriptionForeground);
                margin-bottom: 4px;
                cursor: pointer;
                text-decoration: underline;
            }
            
            .issue-location:hover {
                color: var(--vscode-textLink-foreground);
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
                flex-wrap: wrap;
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
            
            .btn-primary {
                background-color: var(--vscode-button-background);
                color: var(--vscode-button-foreground);
            }
            
            .btn-primary:hover {
                background-color: var(--vscode-button-hoverBackground);
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
            ${generateAutoFixedSection(results)}
        </div>

        <div class="section">
            <h2 class="section-title">👀 Needs Review</h2>
            ${generateRemainingSection(remaining)}
        </div>

        <div class="action-buttons">
            <button class="btn btn-primary" onclick="undoLastFix()">
                ↶ Undo Last Fix
            </button>
            <button class="btn btn-primary" onclick="exportJSON()">
                📄 Export JSON
            </button>
        </div>

        <script>
            const vscode = acquireVsCodeApi();

            function undoLastFix() {
                vscode.postMessage({
                    command: 'undoLastFix'
                });
            }

            function openFile(filePath, line) {
                vscode.postMessage({
                    command: 'openFile',
                    filePath: filePath,
                    line: line || 1
                });
            }

            function exportJSON() {
                vscode.postMessage({
                    command: 'exportJSON'
                });
            }
        </script>
    </body>
    </html>
  `;
}

function generateAutoFixedSection(results: RunResult[]): string {
  const autoFixedIssues = results.filter(r => r.fixed > 0);
  
  if (autoFixedIssues.length === 0) {
    return '<div class="empty-state">No auto-fixes were applied</div>';
  }

  return autoFixedIssues.map(result => {
    const fixedIssues = result.issues.filter(issue => issue.fix?.applied);
    const issueItems = fixedIssues.map(issue => `
      <div class="issue-item issue-fixed">
        <div class="issue-location" onclick="openFile('${issue.file}', ${issue.line})">
          ${issue.file}:${issue.line}
        </div>
        <div class="issue-rule">${issue.rule}</div>
        <div class="issue-message">${issue.message}</div>
      </div>
    `).join('');

    return `
      <div class="tool-group">
        <div class="tool-name">${result.tool} (${result.fixed} fixes)</div>
        ${issueItems}
      </div>
    `;
  }).join('');
}

function generateRemainingSection(remaining: Issue[]): string {
  if (remaining.length === 0) {
    return '<div class="empty-state">🎉 No remaining issues to review!</div>';
  }

  const issueItems = remaining.map(issue => `
    <div class="issue-item issue-remaining">
      <div class="issue-location" onclick="openFile('${issue.file}', ${issue.line})">
        ${issue.file}:${issue.line}
      </div>
      <div class="issue-rule">${issue.rule}</div>
      <div class="issue-message">${issue.message}</div>
    </div>
  `).join('');

  return `
    <div class="tool-group">
      <div class="tool-name">Remaining Issues (${remaining.length})</div>
      ${issueItems}
    </div>
  `;
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
