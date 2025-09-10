import * as vscode from "vscode";
import { QualityHubSidebarProvider } from "./ui/QualityHubSidebarProvider";

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
      console.log("Opening CodeGuard Pro webview...");
      vscode.commands.executeCommand("workbench.view.extension.quality-hub-webview");
      setTimeout(() => {
        vscode.commands.executeCommand("quality-hub.sidebarView.focus");
      }, 100);
    }),

    vscode.commands.registerCommand("quality-hub.openSettings", () => {
      vscode.commands.executeCommand("workbench.action.openSettings", "quality-hub");
    }),

    vscode.commands.registerCommand("quality-hub.test", () => {
      vscode.window.showInformationMessage("CodeGuard Pro extension is working! 🎯");
    }),
  ];
}

// Finalize activation by registering all commands and showing success message
function finalizeActivation(context: vscode.ExtensionContext, commands: vscode.Disposable[]): void {
  context.subscriptions.push(...commands);

  console.log("CodeGuard Pro: Extension activated successfully!");
  vscode.window.showInformationMessage(
    "CodeGuard Pro extension activated! Click the dashboard icon in the activity bar.",
  );
}

export function activate(context: vscode.ExtensionContext): void {
  console.log("CodeGuard Pro: Starting activation...");

  try {
    // Setup sidebar provider
    setupSidebarProvider(context);

    // Register all command categories
    const allCommands = [
      ...registerEssentialCommands(),
    ];

    // Finalize activation
    finalizeActivation(context, allCommands);
  } catch (error) {
    console.error("CodeGuard Pro: Failed to activate extension:", error);
    vscode.window.showErrorMessage(`CodeGuard Pro activation failed: ${String(error)}`);
  }
}

export function deactivate(): void {
  console.log("CodeGuard Pro: Extension deactivated");
}
