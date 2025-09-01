import { ToolDefinitions } from './ToolDefinitions';
import { ToolInfo } from './types';

export class HtmlTemplateGenerator {
  constructor(private formatLastRunTime: (timestamp: number | undefined) => string) {}

  generateWebviewHtml(toolLastRunTimes: Map<string, number>, opts?: { nonce: string; cspSource: string }): string {
    const header = this.generateHeader(opts);
    const lintingCategory = this.createCategory('', 'Linting & Formatting', this.getLintingTools(), toolLastRunTimes);
    const securityCategory = this.createCategory('', 'Security Tools', this.getSecurityTools(), toolLastRunTimes);
    const testingCategory = this.createCategory('', 'Testing Tools', this.getTestingTools(), toolLastRunTimes);
    const analysisCategory = this.createCategory('', 'Analysis Tools', this.getAnalysisTools(), toolLastRunTimes);
    const dependenciesCategory = this.createCategory('', 'Dependencies', this.getDependencyTools(), toolLastRunTimes);
    const apiCategory = this.createCategory('', 'API Tools', this.getApiTools(), toolLastRunTimes);
    const footer = this.generateFooter(opts);
    return header + lintingCategory + securityCategory + testingCategory + analysisCategory + dependenciesCategory + apiCategory + footer;
  }

  private generateHeader(opts?: { nonce: string; cspSource: string }): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CodeGuard Pro</title>
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${(opts&&opts.cspSource)||''} https:; style-src ${(opts&&opts.cspSource)||''} 'unsafe-inline'; script-src 'nonce-${(opts||{nonce:''}).nonce}';">
  <style>
    ${this.generateStyles()}
  </style>
</head>
<body>
  <div class="header">
    <div class="title">CodeGuard Pro</div>
    <div class="subtitle">Code quality, security & testing tools</div>
  </div>
  
  <div class="button-row">
    <button class="refresh-btn" onclick="refresh()">Refresh</button>
    <button class="settings-btn" onclick="openSettings()">Settings</button>
  </div>`;
  }

  private generateStyles(): string {
    return this.getBaseStyles() + this.getCategoryStyles() + this.getToolStyles() + this.getButtonStyles();
  }

  private getBaseStyles(): string {
    return `
      body { font-family: var(--vscode-font-family); color: var(--vscode-foreground); background-color: var(--vscode-sidebar-background); margin:0; padding:8px; font-size: var(--vscode-font-size); line-height: 1.4; }
      .header { text-align:center; margin-bottom:16px; padding:12px; background: var(--vscode-editor-background); border-radius:6px; border:1px solid var(--vscode-panel-border); }
      .title { font-size:1.2em; font-weight:600; margin-bottom:4px; color: var(--vscode-titleBar-activeForeground); }
      .subtitle { font-size:0.85em; color: var(--vscode-descriptionForeground); }`;
  }

  private getCategoryStyles(): string {
    return `
      .category { margin-bottom: 8px; }
      .category-header { display:flex; align-items:center; padding:8px 12px; background: var(--vscode-list-inactiveSelectionBackground); border:1px solid var(--vscode-panel-border); border-radius:4px; cursor:pointer; font-weight:600; font-size:0.95em; }
      .category-icon { margin-right:8px; }
      .expand-icon { margin-left:auto; transition: transform 0.2s ease; transform: rotate(-90deg); }
      .category.expanded .expand-icon { transform: rotate(0deg); }
      .category-content { margin-top:8px; display:none; }
      .category.expanded .category-content { display:block; }`;
  }

  private getToolStyles(): string {
    return `
      .tool-item { background: var(--vscode-editor-background); border:1px solid var(--vscode-panel-border); border-radius:4px; padding:8px; margin-bottom:6px; }
      .tool-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; }
      .tool-name { font-weight:500; font-size:0.9em; }
      .tool-last-run { font-size:0.75em; color: var(--vscode-descriptionForeground); }
      .tool-description { font-size:0.8em; color: var(--vscode-descriptionForeground); margin-bottom:8px; line-height:1.3; }
      .tool-buttons { display:flex; gap:4px; }`;
  }

  private getButtonStyles(): string {
    return `
      .button-row { display:flex; gap:8px; margin-bottom:16px; }
      .refresh-btn,.settings-btn { flex:1; padding:8px; border:none; border-radius:4px; cursor:pointer; font-size:0.9em; }
      .mcp-btn, .ide-btn { width:calc(50% - 4px); padding:6px 12px; margin:8px 0; border:none; border-radius:4px; cursor:pointer; font-size:0.85em; font-weight:500; }
      .mcp-btn { background: var(--vscode-button-background); color: var(--vscode-button-foreground); border: 1px solid var(--vscode-button-border, transparent); }
      .mcp-btn:hover { background: var(--vscode-button-hoverBackground); }
      .ide-btn { background: var(--vscode-button-secondaryBackground); color: var(--vscode-button-secondaryForeground); border: 1px solid var(--vscode-button-border, transparent); }
      .refresh-btn { background: var(--vscode-button-background); color: var(--vscode-button-foreground); }
      .settings-btn { background: var(--vscode-button-secondaryBackground); color: var(--vscode-button-secondaryForeground); }
      .run-mcp-btn,.run-ide-btn { flex:1; padding:6px 8px; border:none; border-radius:3px; cursor:pointer; font-size:0.8em; font-weight:500; }
      .run-mcp-btn { background: var(--vscode-button-background); color: var(--vscode-button-foreground); }
      .run-ide-btn { background: var(--vscode-button-secondaryBackground); color: var(--vscode-button-secondaryForeground); }`;
  }

  private generateFooter(opts?: { nonce: string }): string {
    return `
    <script nonce="${(opts||{nonce:''}).nonce}">
      const vscode = acquireVsCodeApi();
      function toggleCategory(header){ header.parentElement.classList.toggle('expanded'); }
      function runIDETool(toolId){ vscode.postMessage({command:'runIDETool', toolId}); }
      function runMCPTool(toolId, category){ vscode.postMessage({command:'runMCPTool', toolId, category}); }
      function refresh(){ vscode.postMessage({command:'refresh'}); }
      function openSettings(){ vscode.postMessage({command:'openSettings'}); }
      function runMCPCategory(category, event){ const altPressed = event && event.altKey; vscode.postMessage({command:'runMCPCategory', category, quickPick:altPressed}); }
      function runIDECategory(category){ vscode.postMessage({command:'runIDECategory', category}); }
    </script>
</body>
</html>`;
  }

  private createCategory(
    _icon: string,
    title: string,
    tools: ToolInfo[],
    toolLastRunTimes: Map<string, number>
  ): string {
    const toolItems = tools
      .map((tool) => {
        const lastRun = this.formatLastRunTime(toolLastRunTimes.get(tool.id));
        return `
          <div class="tool-item">
            <div class="tool-header">
              <div class="tool-name">${tool.name}</div>
              <div class="tool-last-run">${lastRun}</div>
            </div>
            <div class="tool-description">${tool.desc}</div>
            <div class="tool-buttons">
              <button class="run-mcp-btn" title="Run via Model Context Protocol (no local deps)" onclick="runMCPTool('${tool.id}', '${title === 'API Tools' ? 'api' : title === 'Linting & Formatting' ? 'linting' : title === 'Testing Tools' ? 'testing' : title === 'Security Tools' ? 'security' : title === 'Analysis Tools' ? 'analysis' : 'dependencies'}')">Run MCP</button>
              <button class="run-ide-btn" title="Run using local/workspace tools" onclick="runIDETool('${tool.id}')">Run Local</button>
            </div>
          </div>`;
      })
      .join('');

    // Add MCP/Local buttons for each category
    const catKey = title === 'Linting & Formatting' ? 'linting'
      : title === 'Testing Tools' ? 'testing'
      : title === 'Security Tools' ? 'security'
      : title === 'Analysis Tools' ? 'analysis'
      : title === 'Dependencies' ? 'dependencies'
      : 'api';
    const mcpButton = `<div style="display:flex; gap:8px;">
      <button class=\"mcp-btn\" onclick=\"runMCPCategory('${catKey}', event)\" title=\"Runs via Model Context Protocol (no local deps required)\">Run All (MCP)</button>
      <button class=\"ide-btn\" onclick=\"runIDECategory('${catKey}')\" title=\"Runs using workspace/local tools\">Run All (Local)</button>
    </div>`;

    return `
    <div class="category">
      <div class="category-header" onclick="toggleCategory(this)">
        <span class="category-icon"></span>
        <span>${title}</span>
        <span class="expand-icon">▸</span>
      </div>
      ${mcpButton}
      <div class="category-content">${toolItems}</div>
    </div>`;
  }

  private getLintingTools(): ToolInfo[] { return ToolDefinitions.getLintingTools(); }
  private getSecurityTools(): ToolInfo[] { return ToolDefinitions.getSecurityTools(); }
  private getTestingTools(): ToolInfo[] { return ToolDefinitions.getTestingTools(); }
  private getAnalysisTools(): ToolInfo[] { return ToolDefinitions.getAnalysisTools(); }
  private getDependencyTools(): ToolInfo[] { return ToolDefinitions.getDependencyTools(); }
  private getApiTools(): ToolInfo[] { return ToolDefinitions.getApiTools(); }
}
