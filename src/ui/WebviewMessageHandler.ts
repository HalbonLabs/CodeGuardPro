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
    if (data.toolName) {
      // Don't update last run time - we're only sending a prompt to chat, not running the tool
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
    return `I need your help to run ${toolName} analysis on this project and apply any necessary fixes.

Please:
1. **Run ${toolName}**: Execute the appropriate ${toolName} command for this project
2. **Monitor the output**: Review all results, warnings, errors, and recommendations  
3. **Apply fixes**: Automatically fix any issues that can be resolved (use --fix flags where available)
4. **Report results**: Summarize what was found and what fixes were applied

Please execute the ${toolName} analysis yourself and take action on the results. Thanks!`;
  }
}
