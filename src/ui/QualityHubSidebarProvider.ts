import * as vscode from "vscode";
import { HtmlTemplateGenerator } from "./HtmlTemplateGenerator";
import { WebviewMessageHandler, WebviewMessage } from "./WebviewMessageHandler";

export class QualityHubSidebarProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "qualityHubSidebar";

  private _view?: vscode.WebviewView;
  private readonly _extensionUri: vscode.Uri;
  private readonly toolLastRunTimes: Map<string, number> = new Map();
  private readonly htmlGenerator: HtmlTemplateGenerator;
  private readonly messageHandler: WebviewMessageHandler;

  constructor(readonly context: vscode.ExtensionContext) {
    this._extensionUri = context.extensionUri;
    this.htmlGenerator = new HtmlTemplateGenerator((timestamp) => this.formatLastRunTime(timestamp));
    this.messageHandler = new WebviewMessageHandler(
      (toolId) => this.updateToolLastRunTime(toolId),
      () => this.refreshWebview()
    );
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context?: vscode.WebviewViewResolveContext,
    _token?: vscode.CancellationToken,
  ): void {
    this._view = webviewView;

    this.setupWebview(webviewView);
    this.setupMessageHandling(webviewView);
  }

  private setupWebview(webviewView: vscode.WebviewView): void {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this.getWebviewContent();
  }

  private setupMessageHandling(webviewView: vscode.WebviewView): void {
    webviewView.webview.onDidReceiveMessage((data: WebviewMessage) => {
      this.messageHandler.handleMessage(data);
    });
  }

  private updateToolLastRunTime(toolId: string): void {
    this.toolLastRunTimes.set(toolId, Date.now());
    this.refreshWebview();
  }

  private refreshWebview(): void {
    if (this._view && this._view.webview) {
      this._view.webview.html = this.getWebviewContent();
    }
  }

  private formatLastRunTime(timestamp: number | undefined): string {
    if (!timestamp) {
      return "Never run";
    }

    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) {
      return "Just now";
    } else if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${days}d ago`;
    }
  }

  private getWebviewContent(): string {
    return this.htmlGenerator.generateWebviewHtml(this.toolLastRunTimes);
  }
}
