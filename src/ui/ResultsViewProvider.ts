import * as vscode from 'vscode';
import { RunResult } from '../dispatcher';
import { Issue, ResultsModel } from '../resultsView';

let latestModel: ResultsModel | null = null;
let currentView: vscode.WebviewView | undefined;

export function registerResultsViewProvider(context: vscode.ExtensionContext): void {
  const provider: vscode.WebviewViewProvider = {
    resolveWebviewView(webviewView: vscode.WebviewView): void {
      currentView = webviewView;
      webviewView.webview.options = { enableScripts: true };
      webviewView.webview.html = render(latestModel);

      webviewView.onDidDispose(() => {
        if (currentView === webviewView) currentView = undefined;
      });

      webviewView.webview.onDidReceiveMessage((msg) => {
        if (!latestModel) return;
        switch (msg.command) {
          case 'undoLastFix':
            vscode.commands.executeCommand('codeguard.undoLastFix');
            break;
          case 'exportJSON':
            vscode.commands.executeCommand('workbench.action.files.saveAs');
            break;
          case 'openFile':
            const uri = vscode.Uri.file(msg.filePath);
            vscode.commands.executeCommand('vscode.open', uri, {
              selection: new vscode.Range(msg.line - 1, 0, msg.line - 1, 0)
            });
            break;
        }
      });
    }
  };

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('codeguard.resultsView', provider, {
      webviewOptions: { retainContextWhenHidden: true }
    })
  );
}

export function updateResultsView(model: ResultsModel): void {
  latestModel = model;
  if (currentView) {
    currentView.webview.html = render(model);
  } else {
    // Optionally, reveal the results view for visibility
    vscode.commands.executeCommand('workbench.view.extension.quality-hub-webview');
    vscode.commands.executeCommand('codeguard.sidebarView.focus');
  }
}

function render(model: ResultsModel | null): string {
  const nonce = createNonce();
  const csp = currentView ? currentView.webview.cspSource : '';
  if (!model) {
    return basicHtml('No results yet', '<div class="empty">Run a category to see results.</div>', nonce, csp);
  }
  const { results, remaining } = model;
  const autoFixedCount = results.reduce((t, r) => t + (r.fixed || 0), 0);
  const remainingCount = remaining.length;
  const totalDuration = results.reduce((t, r) => t + (r.duration || 0), 0);

  return basicHtml(
    'CodeGuard Results',
    `
    <div class="header">
      <span class="badge success">${autoFixedCount} Auto-fixed</span>
      <span class="badge warn">${remainingCount} Remaining</span>
      <span class="badge info">${formatDuration(totalDuration)}</span>
    </div>
    ${generateResultGroups(results)}
    ${generateRemaining(remaining)}
    <div class="actions">
      <button onclick="vscode.postMessage({command:'undoLastFix'})">Undo Last Fix</button>
      <button onclick="vscode.postMessage({command:'exportJSON'})">Export JSON</button>
    </div>
    `,
    nonce,
    csp
  );
}

function basicHtml(title: string, bodyHtml: string, nonce: string, cspSource: string): string {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${cspSource} https:; style-src ${cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';" />
    <style>
      body { font-family: var(--vscode-font-family); margin: 0; padding: 16px; color: var(--vscode-foreground); background: var(--vscode-editor-background); }
      .header { display:flex; gap:12px; margin-bottom:16px; }
      .badge { padding:6px 10px; border-radius:16px; font-weight:600; font-size:0.9em; color:#fff; }
      .success{ background:#4caf50; } .warn{ background:#ff9800; } .info{ background:#2196f3; }
      .group{ border:1px solid var(--vscode-panel-border); border-radius:6px; padding:12px; margin-bottom:12px; background: var(--vscode-sideBar-background); }
      .tool{ font-weight:600; margin-bottom:8px; color: var(--vscode-symbolIcon-functionForeground); }
      .issue{ border-left:3px solid var(--vscode-panel-border); background: var(--vscode-editor-background); padding:8px; margin:6px 0; border-radius:4px; }
      .loc{ font-family: var(--vscode-editor-font-family); cursor:pointer; color: var(--vscode-textLink-foreground); text-decoration: underline; }
      .actions{ margin-top:16px; display:flex; gap:8px; }
      button { padding:6px 10px; border:none; border-radius:4px; background: var(--vscode-button-background); color: var(--vscode-button-foreground); cursor:pointer; }
      button:hover { background: var(--vscode-button-hoverBackground); }
      .empty { color: var(--vscode-descriptionForeground); font-style: italic; }
    </style>
  </head>
  <body>
    ${bodyHtml}
    <script nonce="${nonce}">
      const vscode = acquireVsCodeApi();
      function openFile(p, l){ vscode.postMessage({command:'openFile', filePath:p, line:l||1}); }
    </script>
  </body>
  </html>`;
}

function generateResultGroups(results: RunResult[]): string {
  if (!results || results.length === 0) return '';
  return results.map(res => {
    const items = (res.issues || []).map((issue: Issue, i: number) => `
      <div class="issue">
        <div class="loc" onclick="openFile('${issue.file}', ${issue.line})">${issue.file}:${issue.line}</div>
        <div>${issue.rule} • ${escapeHtml(issue.message || '')}</div>
      </div>`).join('');
    const backend = res.backend === 'IDE' ? 'Local' : 'MCP';
    return `<div class="group"><div class="tool">${res.tool} <span style="opacity:0.8">(${backend})</span> - ${res.issues?.length || 0} issues, ${res.fixed || 0} fixed</div>${items}</div>`;
  }).join('');
}

function generateRemaining(issues: Issue[]): string {
  if (!issues || issues.length === 0) return '<div class="empty">No remaining issues to review.</div>';
  const items = issues.map(issue => `
    <div class="issue">
      <div class="loc" onclick="openFile('${issue.file}', ${issue.line})">${issue.file}:${issue.line}</div>
      <div>${issue.rule} • ${escapeHtml(issue.message || '')}</div>
    </div>`).join('');
  return `<div class="group"><div class="tool">Needs Review</div>${items}</div>`;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function formatDuration(ms: number): string {
  if (!ms || ms < 1000) return `${ms|0}ms`;
  const s = Math.round(ms/1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s/60); const r = s%60; return `${m}m ${r}s`;
}

function createNonce(): string {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let text = '';
  for (let i = 0; i < 16; i++) text += possible.charAt(Math.floor(Math.random()*possible.length));
  return text;
}



