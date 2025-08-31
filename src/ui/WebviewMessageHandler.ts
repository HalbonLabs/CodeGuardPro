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

  handleMessage(data: WebviewMessage): void {
    switch (data.command) {
      case "runTool":
        this.handleRunTool(data);
        break;
      case "runToolWithAI":
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
    if (data.toolId && data.toolCommand) {
      this.updateToolLastRunTime(data.toolId);
      vscode.commands.executeCommand(data.toolCommand);
    }
  }

  private handleRunToolWithAI(data: WebviewMessage): void {
    if (data.toolId && data.toolName) {
      this.updateToolLastRunTime(data.toolId);
      const prompt = this.generateAIPrompt(data.toolName);
      vscode.commands.executeCommand("workbench.action.chat.open", {
        query: prompt,
      });
    }
  }

  private handleRefresh(): void {
    this.refreshWebview();
  }

  private handleOpenSettings(): void {
    vscode.commands.executeCommand("workbench.action.openSettings", "quality-hub");
  }

  private generateAIPrompt(toolName: string): string {
    const baseMessage = `I need your help to run ${toolName} analysis on this project. ` +
      `IMPORTANT: Do not execute any VS Code commands or extensions - only run terminal/command line tools.`;
    
    const steps = `

Please follow these steps:

1. **Install Dependencies**: First check if ${toolName} is installed, and if not, ` +
      `install any required packages (npm/npx/global installation as needed)

2. **Execute Terminal Command**: Run the ${toolName} analysis using appropriate ` +
      `terminal commands (NOT VS Code commands)

3. **Monitor Output**: Carefully review all output, warnings, errors, and recommendations

4. **Apply Fixes**: After the analysis completes, immediately:
   - Fix any auto-fixable issues (using --fix flags where available)
   - Apply recommended security patches
   - Update any outdated dependencies if suggested
   - Create or update configuration files if needed
   - Address any critical or high-severity issues found

5. **Summary**: Provide a clear summary of:
   - What issues were found
   - What fixes were applied automatically
   - Any remaining issues that need manual attention
   - Next recommended actions

Please execute the appropriate terminal commands only and take immediate action on the results. 
Don't just report issues - fix them where possible!`;

    return baseMessage + steps;
  }
}
