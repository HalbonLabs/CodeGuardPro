// Status Bar Manager for CodeGuard Pro Extension
import * as vscode from 'vscode';

export class StatusBarManager {
  private statusBarItem: vscode.StatusBarItem;
  private isVisible = false;

  constructor() {
    this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    this.statusBarItem.command = 'quality-hub.showSimple';
    this.updateStatusBar('Ready');
  }

  updateStatusBar(text: string, tooltip?: string): void {
    this.statusBarItem.text = `$(shield) CodeGuard Pro: ${text}`;
    this.statusBarItem.tooltip = tooltip || `CodeGuard Pro - ${text}`;
    
    if (!this.isVisible) {
      this.statusBarItem.show();
      this.isVisible = true;
    }
  }

  setRunning(tool: string): void {
    this.updateStatusBar(`Running ${tool}...`, `CodeGuard Pro is currently running ${tool}`);
  }

  setIdle(): void {
    this.updateStatusBar('Ready', 'CodeGuard Pro is ready to analyze your code');
  }

  setError(message: string): void {
    this.updateStatusBar('Error', `Error: ${message}`);
  }

  setSuccess(tool: string): void {
    this.updateStatusBar(`${tool} Complete`, `${tool} analysis completed successfully`);
  }

  hide(): void {
    if (this.isVisible) {
      this.statusBarItem.hide();
      this.isVisible = false;
    }
  }

  show(): void {
    if (!this.isVisible) {
      this.statusBarItem.show();
      this.isVisible = true;
    }
  }

  dispose(): void {
    this.statusBarItem.dispose();
  }
}
