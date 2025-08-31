import * as vscode from 'vscode';

export class QualityHubSidebarProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'qualityHubSidebar';

  private _view?: vscode.WebviewView;
  private readonly _extensionUri: vscode.Uri;
  private toolLastRunTimes: Map<string, number> = new Map();

  constructor(private readonly context: vscode.ExtensionContext) {
    this._extensionUri = context.extensionUri;
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    };

    webviewView.webview.html = this.getWebviewContent();

    webviewView.webview.onDidReceiveMessage(data => {
      switch (data.command) {
        case 'runTool':
          this.updateToolLastRunTime(data.toolId);
          vscode.commands.executeCommand(data.toolCommand);
          break;
        case 'runToolWithAI':
          this.updateToolLastRunTime(data.toolId);
          vscode.commands.executeCommand(data.toolCommand);
          break;
        case 'refresh':
          webviewView.webview.html = this.getWebviewContent();
          break;
        case 'openSettings':
          vscode.commands.executeCommand('workbench.action.openSettings', 'quality-hub');
          break;
      }
    });
  }

  private updateToolLastRunTime(toolId: string) {
    this.toolLastRunTimes.set(toolId, Date.now());
    if (this._view) {
      this._view.webview.html = this.getWebviewContent();
    }
  }

  private getToolLastRunTime(toolId: string): number | undefined {
    return this.toolLastRunTimes.get(toolId);
  }

  private formatLastRunTime(timestamp: number | undefined): string {
    if (!timestamp) {
      return 'Never run';
    }
    
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) {
      return 'Just now';
    } else if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${days}d ago`;
    }
  }

  private getWebviewContent(): string {
    return this.buildWebviewHTML();
  }

  private buildWebviewHTML(): string {
    const header = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CodeGuard Pro</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            color: var(--vscode-foreground);
            background-color: var(--vscode-sidebar-background);
            margin: 0;
            padding: 8px;
            font-size: var(--vscode-font-size);
            line-height: 1.4;
        }
        .header {
            text-align: center;
            margin-bottom: 16px;
            padding: 12px;
            background: var(--vscode-editor-background);
            border-radius: 6px;
            border: 1px solid var(--vscode-panel-border);
        }
        .title {
            font-size: 1.2em;
            font-weight: 600;
            margin-bottom: 4px;
            color: var(--vscode-titleBar-activeForeground);
        }
        .subtitle {
            font-size: 0.85em;
            color: var(--vscode-descriptionForeground);
        }
        .button-row {
            display: flex;
            gap: 8px;
            margin-bottom: 16px;
        }
        .refresh-btn, .settings-btn {
            flex: 1;
            padding: 8px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.9em;
        }
        .refresh-btn {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
        }
        .settings-btn {
            background: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }
        .category {
            margin-bottom: 8px;
        }
        .category-header {
            display: flex;
            align-items: center;
            padding: 8px 12px;
            background: var(--vscode-list-inactiveSelectionBackground);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 4px;
            cursor: pointer;
            font-weight: 600;
            font-size: 0.95em;
        }
        .category-icon {
            margin-right: 8px;
        }
        .expand-icon {
            margin-left: auto;
            transition: transform 0.2s ease;
            transform: rotate(-90deg);
        }
        .category.expanded .expand-icon {
            transform: rotate(0deg);
        }
        .category-content {
            margin-top: 8px;
            display: none;
        }
        .category.expanded .category-content {
            display: block;
        }
        .tool-item {
            background: var(--vscode-editor-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 4px;
            padding: 8px;
            margin-bottom: 6px;
        }
        .tool-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 4px;
        }
        .tool-name {
            font-weight: 500;
            font-size: 0.9em;
        }
        .tool-last-run {
            font-size: 0.75em;
            color: var(--vscode-descriptionForeground);
        }
        .tool-description {
            font-size: 0.8em;
            color: var(--vscode-descriptionForeground);
            margin-bottom: 8px;
            line-height: 1.3;
        }
        .tool-buttons {
            display: flex;
            gap: 4px;
        }
        .run-btn, .ai-btn {
            flex: 1;
            padding: 6px 8px;
            border: none;
            border-radius: 3px;
            cursor: pointer;
            font-size: 0.8em;
            font-weight: 500;
        }
        .run-btn {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
        }
        .ai-btn {
            background: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }
        .ai-btn:before {
            content: "🤖 ";
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">CodeGuard Pro</div>
        <div class="subtitle">Code quality, security & testing tools</div>
    </div>
    
    <div class="button-row">
        <button class="refresh-btn" onclick="refresh()">🔄 Refresh</button>
        <button class="settings-btn" onclick="openSettings()">⚙️ Settings</button>
    </div>`;

    const lintingCategory = this.createCategory('🔧', 'Linting & Formatting', [
      { id: 'eslint', name: 'ESLint', cmd: 'quality-hub.eslintCode', desc: 'Industry-standard JavaScript/TypeScript linting with extensive rule ecosystem and auto-fix capabilities.' },
      { id: 'biome', name: 'Biome', cmd: 'quality-hub.biomeCode', desc: 'Ultra-fast formatter, linter, and bundler for web projects. Combines the functionality of Prettier, ESLint, and more in a single tool.' },
      { id: 'typescript-eslint', name: 'TypeScript ESLint', cmd: 'quality-hub.typescriptEslint', desc: 'Specialized ESLint configuration for TypeScript projects. Provides type-aware linting rules and TypeScript-specific code quality checks.' },
      { id: 'prettier', name: 'Prettier', cmd: 'quality-hub.prettier', desc: 'Opinionated code formatter that enforces consistent style. Automatically formats code for readability and maintainability across your team.' },
      { id: 'standardjs', name: 'StandardJS', cmd: 'quality-hub.standardjs', desc: 'Zero-configuration JavaScript style guide and linter. Enforces consistent coding style without the need for configuration files.' }
    ]);

    const securityCategory = this.createCategory('🔒', 'Security Tools', [
      { id: 'npm-audit', name: 'npm audit', cmd: 'quality-hub.npmAudit', desc: 'Built-in npm security audit tool for identifying vulnerabilities in dependencies.' },
      { id: 'eslint-security', name: 'ESLint Security', cmd: 'quality-hub.eslintSecurity', desc: 'Security-focused ESLint rules to identify potential security vulnerabilities in JavaScript code.' },
      { id: 'retire-js', name: 'Retire.js', cmd: 'quality-hub.retireJs', desc: 'Scanner for identifying known vulnerabilities in JavaScript libraries and dependencies.' },
      { id: 'audit-ci', name: 'audit-ci', cmd: 'quality-hub.auditCi', desc: 'Audit your NPM dependencies in continuous integration environments with configurable thresholds.' },
      { id: 'owasp-check', name: 'OWASP Dependency Check', cmd: 'quality-hub.owaspCheck', desc: 'OWASP dependency check utility that identifies project dependencies and checks if there are any known, publicly disclosed, vulnerabilities.' }
    ]);

    const testingCategory = this.createCategory('🧪', 'Testing Tools', [
      { id: 'playwright', name: 'Playwright', cmd: 'quality-hub.playwright', desc: 'Modern end-to-end testing framework with support for multiple browsers, devices, and platforms.' },
      { id: 'cypress', name: 'Cypress', cmd: 'quality-hub.cypress', desc: 'JavaScript end-to-end testing framework with time-travel debugging and real-time browser testing.' },
      { id: 'jest', name: 'Jest', cmd: 'quality-hub.jest', desc: 'Delightful JavaScript testing framework with built-in mocking, assertion library, and code coverage reports.' },
      { id: 'mocha', name: 'Mocha', cmd: 'quality-hub.mocha', desc: 'Feature-rich JavaScript test framework running on Node.js and in the browser, making asynchronous testing simple.' },
      { id: 'vitest', name: 'Vitest', cmd: 'quality-hub.vitest', desc: 'A blazing fast unit test framework powered by Vite. Compatible with Jest APIs for easy migration.' },
      { id: 'webdriverio', name: 'WebdriverIO', cmd: 'quality-hub.webdriverio', desc: 'Next-gen browser and mobile automation test framework for Node.js with built-in test runner.' }
    ]);

    const analysisCategory = this.createCategory('📊', 'Analysis Tools', [
      { id: 'sonar-js', name: 'SonarJS', cmd: 'quality-hub.sonarJs', desc: 'Static code analysis tool for JavaScript and TypeScript that detects bugs, vulnerabilities, and code smells.' },
      { id: 'plato', name: 'Plato', cmd: 'quality-hub.plato', desc: 'JavaScript source code visualization, static analysis, and complexity analysis tool with beautiful reports.' },
      { id: 'eslint-complexity', name: 'ESLint Complexity', cmd: 'quality-hub.eslintComplexity', desc: 'Measure and enforce cyclomatic complexity limits in your code. Helps identify overly complex functions that may be hard to maintain.' },
      { id: 'duplicate-code', name: 'Duplicate Code Detection', cmd: 'quality-hub.duplicateCode', desc: 'Find and report copy-pasted code blocks across your project. Helps identify refactoring opportunities and reduce technical debt.' },
      { id: 'code-structure', name: 'Code Structure Analysis', cmd: 'quality-hub.codeStructure', desc: 'Analyze project file structure, module organization, and architectural patterns. Provides insights into codebase organization and scalability.' }
    ]);

    const dependenciesCategory = this.createCategory('📦', 'Dependencies', [
      { id: 'madge-deps', name: 'Madge Dependencies', cmd: 'quality-hub.madgeDeps', desc: 'Detect circular dependencies and generate dependency graphs. Visualize module relationships and identify problematic dependency cycles.' },
      { id: 'depcheck', name: 'Depcheck', cmd: 'quality-hub.depcheck', desc: 'Find unused dependencies and missing dependencies in your project. Helps keep package.json clean and reduces bundle size.' },
      { id: 'update-deps', name: 'Update Dependencies', cmd: 'quality-hub.updateDependencies', desc: 'Check for available updates to project dependencies and get detailed upgrade information. Helps keep dependencies current and secure.' }
    ]);

    const apiCategory = this.createCategory('🌐', 'API Tools', [
      { id: 'sonarqube-api', name: 'SonarQube API', cmd: 'quality-hub.sonarQubeApi', desc: 'Connect to SonarQube server for enterprise-grade code quality analysis. Push metrics and retrieve detailed quality gate results and project insights.' },
      { id: 'codacy-api', name: 'Codacy API', cmd: 'quality-hub.codacyApi', desc: 'Connect to Codacy platform for automated code review and quality analysis. Track code quality metrics and receive detailed improvement suggestions.' },
      { id: 'codeclimate-api', name: 'CodeClimate API', cmd: 'quality-hub.codeClimateApi', desc: 'Connect to CodeClimate for maintainability and test coverage analysis. Get actionable insights to improve code quality over time.' },
      { id: 'snyk-api', name: 'Snyk Code API', cmd: 'quality-hub.snykCodeApi', desc: 'Connect to Snyk security platform for vulnerability scanning and license compliance. Real-time security monitoring and fix recommendations.' },
      { id: 'codefactor-api', name: 'CodeFactor API', cmd: 'quality-hub.codeFactorApi', desc: 'Connect to CodeFactor for continuous code quality monitoring. Get real-time feedback on code changes and maintain quality standards.' }
    ]);

    const footer = `
    <script>
        const vscode = acquireVsCodeApi();

        function toggleCategory(header) {
            const category = header.parentElement;
            category.classList.toggle('expanded');
        }

        function runTool(command, toolName, toolId) {
            vscode.postMessage({
                command: 'runTool',
                toolCommand: command,
                toolName: toolName,
                toolId: toolId
            });
        }

        function runWithAI(command, toolName, toolId) {
            vscode.postMessage({
                command: 'runToolWithAI',
                toolCommand: command,
                toolName: toolName,
                toolId: toolId
            });
        }

        function refresh() {
            vscode.postMessage({
                command: 'refresh'
            });
        }

        function openSettings() {
            vscode.postMessage({
                command: 'openSettings'
            });
        }
    </script>
</body>
</html>`;

    return header + lintingCategory + securityCategory + testingCategory + analysisCategory + dependenciesCategory + apiCategory + footer;
  }

  private createCategory(icon: string, title: string, tools: Array<{id: string, name: string, cmd: string, desc: string}>): string {
    const toolItems = tools.map(tool => {
      const lastRun = this.formatLastRunTime(this.getToolLastRunTime(tool.id));
      return `
            <div class="tool-item">
                <div class="tool-header">
                    <div class="tool-name">${tool.name}</div>
                    <div class="tool-last-run">${lastRun}</div>
                </div>
                <div class="tool-description">${tool.desc}</div>
                <div class="tool-buttons">
                    <button class="run-btn" onclick="runTool('${tool.cmd}', '${tool.name}', '${tool.id}')">Run</button>
                    <button class="ai-btn" onclick="runWithAI('${tool.cmd}', '${tool.name}', '${tool.id}')">Run with AI</button>
                </div>
            </div>`;
    }).join('');

    return `
    <div class="category">
        <div class="category-header" onclick="toggleCategory(this)">
            <span class="category-icon">${icon}</span>
            <span>${title}</span>
            <span class="expand-icon">▼</span>
        </div>
        <div class="category-content">${toolItems}
        </div>
    </div>`;
  }
}
