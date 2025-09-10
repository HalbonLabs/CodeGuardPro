import * as vscode from "vscode";

export interface WebviewMessage {
  command: "runTool" | "runToolWithAI" | "refresh" | "openSettings";
  toolId?: string;
  toolCommand?: string;
  toolName?: string;
}

export class WebviewMessageHandler {
  constructor(
    private updateToolLastRunTime: (toolId: string) => void,
    private refreshWebview: () => void
  ) {}

  private getMCPConfig() {
    const config = vscode.workspace.getConfiguration('quality-hub');
    return {
      enabled: config.get('mcp.enabled', true),
      eslint: {
        enabled: config.get('mcp.eslint.enabled', true),
        endpoint: config.get('mcp.eslint.endpoint', '')
      },
      codacy: {
        enabled: config.get('mcp.codacy.enabled', true),
        endpoint: config.get('mcp.codacy.endpoint', ''),
        apiToken: config.get('mcp.codacy.apiToken', ''),
        projectId: config.get('mcp.codacy.projectId', '')
      },
      codeRunner: {
        enabled: config.get('mcp.codeRunner.enabled', true),
        endpoint: config.get('mcp.codeRunner.endpoint', '')
      },
      sequentialThinking: {
        enabled: config.get('mcp.sequentialThinking.enabled', true),
        endpoint: config.get('mcp.sequentialThinking.endpoint', '')
      },
      timeout: config.get('mcp.timeout', 30000),
      retryAttempts: config.get('mcp.retryAttempts', 3),
      retryDelay: config.get('mcp.retryDelay', 1000),
      logLevel: config.get('mcp.logLevel', 'info'),
      cache: {
        enabled: config.get('mcp.cache.enabled', true),
        ttl: config.get('mcp.cache.ttl', 300000)
      },
      fallbackToLocal: config.get('mcp.fallbackToLocal', true),
      customServers: config.get('mcp.customServers', [])
    };
  }

  handleMessage(data: WebviewMessage): void {
    console.log('WebviewMessageHandler received message:', data);
    
    switch (data.command) {
      case "runTool":
        console.log('Handling runTool command');
        this.handleRunTool(data);
        break;
      case "runToolWithAI":
        console.log('Handling runToolWithAI command');
        this.handleRunToolWithAI(data);
        break;
      case "refresh":
        this.handleRefresh();
        break;
      case "openSettings":
        this.handleOpenSettings();
        break;
    }
  }

  private handleRunTool(data: WebviewMessage): void {
    if (data.toolId && data.toolName) {
      const config = this.getMCPConfig();
      if (!config.enabled) {
        vscode.window.showWarningMessage('MCP is disabled in settings. Please enable MCP in the CodeGuard Pro extension settings to run tools.');
        return;
      }
      
      this.updateToolLastRunTime(data.toolId);
      const prompt = this.generateMCPPrompt(data.toolId, data.toolName);
      
      vscode.commands.executeCommand("workbench.action.chat.open", {
        query: prompt,
      });
    }
  }

  private handleRunToolWithAI(data: WebviewMessage): void {
    console.log('handleRunToolWithAI called with data:', data);
    
    if (data.toolId && data.toolName) {
      const config = this.getMCPConfig();
      if (!config.enabled) {
        vscode.window.showWarningMessage('MCP is disabled in settings. Please enable MCP in the CodeGuard Pro extension settings to run tools.');
        return;
      }
      
      console.log('Running MCP tool for:', data.toolName);
      this.updateToolLastRunTime(data.toolId);
      const prompt = this.generateMCPPrompt(data.toolId, data.toolName);
      console.log('Generated MCP prompt:', prompt);
      
      vscode.commands.executeCommand("workbench.action.chat.open", {
        query: prompt,
      });
    } else {
      console.log('Missing toolId or toolName in AI request');
    }
  }

  private handleRefresh(): void {
    this.refreshWebview();
  }

  private handleOpenSettings(): void {
    vscode.commands.executeCommand("workbench.action.openSettings", "quality-hub mcp");
  }

  private runMCPTool(toolId: string, toolName: string): void {
    const toolMapping = this.getToolMapping();
    const handler = toolMapping[toolId];
    
    if (handler) {
      handler.call(this, toolName);
    } else {
      vscode.window.showInformationMessage(`MCP tool for ${toolName} is not yet implemented`);
    }
  }

  private getToolMapping(): { [key: string]: (toolName: string) => void } {
    return {
      'eslint': this.runEslintMCP,
      'biome': (toolName) => this.runCodeRunnerMCP('npx @biomejs/biome check --apply .', toolName),
      'typescript-eslint': (toolName) =>
        this.runCodeRunnerMCP('npx eslint . --ext .ts,.tsx --parser @typescript-eslint/parser', toolName),
      'prettier': (toolName) => this.runCodeRunnerMCP('npx prettier --write .', toolName),
      'standardjs': (toolName) => this.runCodeRunnerMCP('npx standard --fix', toolName),
      'npm-audit': (toolName) => this.runCodeRunnerMCP('npm audit --audit-level moderate', toolName),
      'eslint-security': (toolName) =>
        this.runCodeRunnerMCP('npx eslint . --ext .js,.ts --plugin=security', toolName),
      'retire-js': (toolName) => this.runCodeRunnerMCP('npx retire --js', toolName),
      'audit-ci': (toolName) => this.runCodeRunnerMCP('npx audit-ci', toolName),
      'owasp-check': (toolName) =>
        this.runCodeRunnerMCP('npx owasp-dependency-check --project . --format ALL', toolName),
      'playwright': (toolName) => this.runCodeRunnerMCP('npx playwright test', toolName),
      'cypress': (toolName) => this.runCodeRunnerMCP('npx cypress run', toolName),
      'jest': (toolName) => this.runCodeRunnerMCP('npx jest', toolName),
      'mocha': (toolName) => this.runCodeRunnerMCP('npx mocha', toolName),
      'vitest': (toolName) => this.runCodeRunnerMCP('npx vitest run', toolName),
      'webdriverio': (toolName) => this.runCodeRunnerMCP('npx wdio run', toolName),
      'sonar-js': (toolName) => this.runCodeRunnerMCP('npx eslint . --ext .js,.ts', toolName),
      'plato': (toolName) => this.runCodeRunnerMCP('npx plato -r -d plato-report .', toolName),
      'eslint-complexity': (toolName) =>
        this.runCodeRunnerMCP('npx eslint . --ext .js,.ts --rule \'complexity: [error, 10]\'', toolName),
      'duplicate-code': (toolName) => this.runCodeRunnerMCP('npx jscpd .', toolName),
      'code-structure': (toolName) =>
        this.runCodeRunnerMCP('find src -name \'*.ts\' -o -name \'*.js\' | head -20', toolName),
      'madge-deps': (toolName) =>
        this.runCodeRunnerMCP('npx madge --circular --extensions ts,js .', toolName),
      'depcheck': (toolName) => this.runCodeRunnerMCP('npx depcheck', toolName),
      'update-deps': (toolName) => this.runCodeRunnerMCP('npx npm-check-updates', toolName),
      'codacy-api': this.runCodacyMCP
    };
  }

  private runEslintMCP(): void {
    // Use the MCP ESLint tool
    // This would call mcp_eslint_lint-files with appropriate parameters
    vscode.window.showInformationMessage('Running ESLint via MCP...');
    // Note: Actual MCP call would be handled by the AI assistant
  }

  private runCodacyMCP(): void {
    // Use the MCP Codacy tool
    vscode.window.showInformationMessage('Running Codacy analysis via MCP...');
    // Note: Actual MCP call would be handled by the AI assistant
  }

  private runCodeRunnerMCP(command: string, toolName: string): void {
    // Use the MCP code runner tool
    vscode.window.showInformationMessage(`Running ${toolName} via MCP code runner...`);
    // Note: Actual MCP call would be handled by the AI assistant
  }

  private generateMCPPrompt(toolId: string, toolName: string): string {
    const config = this.getMCPConfig();
    
    if (!config.enabled) {
      return `MCP is disabled in settings. Please enable MCP in the CodeGuard Pro extension settings to run ${toolName}.`;
    }
    
    const baseMessage = `Please run the ${toolName} analysis tool using the appropriate MCP server. `;
    const configDetails = this.buildConfigDetails(config);
    
    return this.generateToolSpecificPrompt(toolId, toolName, baseMessage, configDetails, config);
  }

  private buildConfigDetails(config: any): string {
    return `Use the following MCP configuration: timeout=${config.timeout}ms, retryAttempts=${config.retryAttempts}, retryDelay=${config.retryDelay}ms, logLevel=${config.logLevel}, cacheEnabled=${config.cache.enabled}, cacheTTL=${config.cache.ttl}ms, fallbackToLocal=${config.fallbackToLocal}. `;
  }

  private generateToolSpecificPrompt(toolId: string, toolName: string, baseMessage: string, configDetails: string, config: any): string {
    switch (toolId) {
      case 'eslint':
        return this.generateEslintPrompt(toolName, baseMessage, configDetails, config);
      case 'codacy-api':
        return this.generateCodacyPrompt(toolName, baseMessage, configDetails, config);
      default:
        return this.generateCodeRunnerPrompt(toolId, toolName, baseMessage, configDetails, config);
    }
  }

  private generateEslintPrompt(toolName: string, baseMessage: string, configDetails: string, config: any): string {
    if (!config.eslint.enabled) {
      return `ESLint MCP is disabled in settings. Please enable ESLint MCP in the CodeGuard Pro extension settings to run ${toolName}.`;
    }
    const endpoint = config.eslint.endpoint ? `Use endpoint: ${config.eslint.endpoint}` : '';
    return baseMessage + configDetails +
      `Use the ESLint MCP tool to lint the TypeScript and JavaScript files in this project. ` +
      `Run mcp_eslint_lint-files on all .ts, .js, .tsx, .jsx files. ${endpoint}`;
  }

  private generateCodacyPrompt(toolName: string, baseMessage: string, configDetails: string, config: any): string {
    if (!config.codacy.enabled) {
      return `Codacy MCP is disabled in settings. Please enable Codacy MCP in the CodeGuard Pro extension settings to run ${toolName}.`;
    }
    const endpoint = config.codacy.endpoint ? `Use endpoint: ${config.codacy.endpoint}` : '';
    const apiToken = config.codacy.apiToken ? `Use API token: ${config.codacy.apiToken}` : '';
    const projectId = config.codacy.projectId ? `Use project ID: ${config.codacy.projectId}` : '';
    return baseMessage + configDetails +
      `Use the Codacy MCP tool to analyze this project. ` +
      `Run mcp_codacy_codacy_cli_analyze with rootPath set to the current workspace path. ` +
      `${endpoint} ${apiToken} ${projectId}`;
  }

  private generateCodeRunnerPrompt(toolId: string, toolName: string, baseMessage: string, configDetails: string, config: any): string {
    if (!config.codeRunner.enabled) {
      return `Code Runner MCP is disabled in settings. Please enable Code Runner MCP in the CodeGuard Pro extension settings to run ${toolName}.`;
    }
    
    const command = this.getToolCommand(toolId);
    const endpoint = config.codeRunner.endpoint ? `Use endpoint: ${config.codeRunner.endpoint}` : '';
    
    if (command) {
      return baseMessage + configDetails + `Use the code runner MCP tool to execute: ${command} ${endpoint}`;
    }
    
    const customServers = config.customServers.length > 0 ?
      `Available custom servers: ${config.customServers.join(', ')}` : '';
    return baseMessage + configDetails +
      `Use the appropriate MCP tool or code runner to execute the ${toolName} analysis. ${customServers}`;
  }

  private getToolCommand(toolId: string): string | null {
    const commands: { [key: string]: string } = {
      'biome': 'npx @biomejs/biome check --apply .',
      'typescript-eslint': 'npx eslint . --ext .ts,.tsx --parser @typescript-eslint/parser',
      'prettier': 'npx prettier --write .',
      'standardjs': 'npx standard --fix',
      'npm-audit': 'npm audit --audit-level moderate',
      'eslint-security': 'npx eslint . --ext .js,.ts --plugin=security',
      'retire-js': 'npx retire --js',
      'audit-ci': 'npx audit-ci',
      'owasp-check': 'npx owasp-dependency-check --project . --format ALL',
      'playwright': 'npx playwright test',
      'cypress': 'npx cypress run',
      'jest': 'npx jest',
      'mocha': 'npx mocha',
      'vitest': 'npx vitest run',
      'webdriverio': 'npx wdio run',
      'sonar-js': 'npx eslint . --ext .js,.ts',
      'plato': 'npx plato -r -d plato-report .',
      'eslint-complexity': 'npx eslint . --ext .js,.ts --rule \'complexity: [error, 10]\'',
      'duplicate-code': 'npx jscpd .',
      'code-structure': 'find src -name \'*.ts\' -o -name \'*.js\' | head -20',
      'madge-deps': 'npx madge --circular --extensions ts,js .',
      'depcheck': 'npx depcheck',
      'update-deps': 'npx npm-check-updates'
    };
    
    return commands[toolId] || null;
  }
}
