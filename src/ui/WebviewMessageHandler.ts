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
    return `Hi! I'd like some help with ${toolName} for my project. 

Could you help me understand:
- How to properly set up and configure ${toolName} for this codebase
- What are the best practices and recommended settings
- How to run ${toolName} analysis and interpret the results
- What common issues ${toolName} can detect and how to fix them

I'm looking for guidance and advice rather than having commands executed automatically. Thanks!`;
  }
}
