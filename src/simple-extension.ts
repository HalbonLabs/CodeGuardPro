import * as vscode from "vscode";
import { QualityHubSidebarProvider } from "./ui/QualityHubSidebarProvider";

// Helper function to run terminal commands
function runToolCommand(toolName: string, command: string) {
  const terminal = vscode.window.createTerminal(`CodeGuard Pro - ${toolName}`);
  terminal.show();
  terminal.sendText(command);
}

export function activate(context: vscode.ExtensionContext) {
  console.log("Quality Hub: Starting activation...");

  try {
    // Create sidebar provider for the main Quality Hub panel
    const sidebarProvider = new QualityHubSidebarProvider(context);
    
    // Register the sidebar webview provider
    context.subscriptions.push(
      vscode.window.registerWebviewViewProvider("quality-hub.sidebarView", sidebarProvider)
    );

    // Ensure the webview is the active view when the container is opened
    context.subscriptions.push(
      vscode.commands.registerCommand("quality-hub.focusWebview", () => {
        vscode.commands.executeCommand("quality-hub.sidebarView.focus");
      })
    );

    // Register only essential commands (tool commands are handled by sidebar provider)
    const commands = [
      vscode.commands.registerCommand("quality-hub.showSimple", () => {
        console.log("Opening Quality Hub webview...");
        // First ensure the webview container is visible
        vscode.commands.executeCommand("workbench.view.extension.quality-hub-webview");
        // Then focus the webview specifically
        setTimeout(() => {
          vscode.commands.executeCommand("quality-hub.sidebarView.focus");
        }, 100);
      }),

      vscode.commands.registerCommand("quality-hub.openSettings", () => {
        vscode.commands.executeCommand("workbench.action.openSettings", "quality-hub");
      }),

      vscode.commands.registerCommand("quality-hub.test", () => {
        vscode.window.showInformationMessage("Quality Hub extension is working! 🎯");
      }),

      // Register all tool commands
      vscode.commands.registerCommand("quality-hub.eslintCode", () => {
        runToolCommand("ESLint", "npx eslint . --ext .ts,.js,.tsx,.jsx --fix");
      }),

      vscode.commands.registerCommand("quality-hub.biomeCode", () => {
        runToolCommand("Biome", "npx @biomejs/biome check --apply .");
      }),

      vscode.commands.registerCommand("quality-hub.typescriptEslint", () => {
        runToolCommand("TypeScript ESLint", "npx eslint . --ext .ts,.tsx --parser @typescript-eslint/parser");
      }),

      vscode.commands.registerCommand("quality-hub.prettier", () => {
        runToolCommand("Prettier", "npx prettier --write .");
      }),

      vscode.commands.registerCommand("quality-hub.standardjs", () => {
        runToolCommand("StandardJS", "npx standard --fix");
      }),

      vscode.commands.registerCommand("quality-hub.npmAudit", () => {
        runToolCommand("npm audit", "npm audit --audit-level moderate");
      }),

      vscode.commands.registerCommand("quality-hub.eslintSecurity", () => {
        runToolCommand("ESLint Security", "npx eslint . --ext .js,.ts --config .eslintrc-security.js");
      }),

      vscode.commands.registerCommand("quality-hub.retireJs", () => {
        runToolCommand("Retire.js", "npx retire --js");
      }),

      vscode.commands.registerCommand("quality-hub.auditCi", () => {
        runToolCommand("audit-ci", "npx audit-ci --config audit-ci.json");
      }),

      vscode.commands.registerCommand("quality-hub.owaspCheck", () => {
        runToolCommand("OWASP Dependency Check", "npx owasp-dependency-check --project . --format ALL");
      }),

      vscode.commands.registerCommand("quality-hub.playwright", () => {
        runToolCommand("Playwright", "npx playwright test");
      }),

      vscode.commands.registerCommand("quality-hub.cypress", () => {
        runToolCommand("Cypress", "npx cypress run");
      }),

      vscode.commands.registerCommand("quality-hub.jest", () => {
        runToolCommand("Jest", "npx jest");
      }),

      vscode.commands.registerCommand("quality-hub.mocha", () => {
        runToolCommand("Mocha", "npx mocha");
      }),

      vscode.commands.registerCommand("quality-hub.vitest", () => {
        runToolCommand("Vitest", "npx vitest run");
      }),

      vscode.commands.registerCommand("quality-hub.webdriverio", () => {
        runToolCommand("WebdriverIO", "npx wdio run");
      }),

      vscode.commands.registerCommand("quality-hub.sonarJs", () => {
        runToolCommand("SonarJS", "npx eslint . --ext .js,.ts --config .eslintrc-sonar.js");
      }),

      vscode.commands.registerCommand("quality-hub.plato", () => {
        runToolCommand("Plato", "npx plato -r -d plato-report src/");
      }),

      vscode.commands.registerCommand("quality-hub.eslintComplexity", () => {
        runToolCommand("ESLint Complexity", "npx eslint . --ext .js,.ts --rule 'complexity: [error, 10]'");
      }),

      vscode.commands.registerCommand("quality-hub.duplicateCode", () => {
        runToolCommand("Duplicate Code Detection", "npx jscpd src/");
      }),

      vscode.commands.registerCommand("quality-hub.codeStructure", () => {
        runToolCommand("Code Structure Analysis", "find src -name '*.ts' -o -name '*.js' | head -20");
      }),

      vscode.commands.registerCommand("quality-hub.madgeDeps", () => {
        runToolCommand("Madge Dependencies", "npx madge --circular --extensions ts,js src/");
      }),

      vscode.commands.registerCommand("quality-hub.depcheck", () => {
        runToolCommand("Depcheck", "npx depcheck");
      }),

      vscode.commands.registerCommand("quality-hub.updateDependencies", () => {
        runToolCommand("Update Dependencies", "npx npm-check-updates");
      }),

      vscode.commands.registerCommand("quality-hub.sonarQubeApi", () => {
        vscode.window.showInformationMessage("SonarQube API integration - Configure in settings");
      }),

      vscode.commands.registerCommand("quality-hub.codacyApi", () => {
        vscode.window.showInformationMessage("Codacy API integration - Configure in settings");
      }),

      vscode.commands.registerCommand("quality-hub.codeClimateApi", () => {
        vscode.window.showInformationMessage("CodeClimate API integration - Configure in settings");
      }),

      vscode.commands.registerCommand("quality-hub.snykCodeApi", () => {
        vscode.window.showInformationMessage("Snyk Code API integration - Configure in settings");
      }),

      vscode.commands.registerCommand("quality-hub.codeFactorApi", () => {
        vscode.window.showInformationMessage("CodeFactor API integration - Configure in settings");
      }),
    ];

    context.subscriptions.push(...commands);

    console.log("Quality Hub: Extension activated successfully!");
    vscode.window.showInformationMessage("Quality Hub extension activated! Click the dashboard icon in the activity bar.");

  } catch (error) {
    console.error("Quality Hub: Failed to activate extension:", error);
    vscode.window.showErrorMessage(`Quality Hub activation failed: ${error}`);
  }
}

export function deactivate() {
  console.log("Quality Hub: Extension deactivated");
}
