// CodeGuard Pro Provider for VS Code Extension
import * as vscode from 'vscode';

export class QualityHubProvider implements vscode.TreeDataProvider<QualityItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<QualityItem | undefined | null | void> = 
    new vscode.EventEmitter<QualityItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<QualityItem | undefined | null | void> = 
    this._onDidChangeTreeData.event;

  private items: QualityItem[] = [];

  constructor() {
    this.initializeItems();
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: QualityItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: QualityItem): Promise<QualityItem[]> {
    if (element) {
      return Promise.resolve(element.children || []);
    } else {
      return Promise.resolve(this.items);
    }
  }

  private initializeItems(): void {
    this.items = [
      new QualityItem(
        'Linting Tools',
        'Analyze code quality and style',
        vscode.TreeItemCollapsibleState.Expanded,
        [
          new QualityItem('ESLint', 'JavaScript/TypeScript linting', vscode.TreeItemCollapsibleState.None),
          new QualityItem('Biome', 'Fast linter and formatter', vscode.TreeItemCollapsibleState.None),
          new QualityItem('Prettier', 'Code formatting', vscode.TreeItemCollapsibleState.None),
          new QualityItem('TypeScript', 'Type checking', vscode.TreeItemCollapsibleState.None)
        ]
      ),
      new QualityItem(
        'Security Tools',
        'Scan for vulnerabilities',
        vscode.TreeItemCollapsibleState.Expanded,
        [
          new QualityItem('npm audit', 'Dependency vulnerabilities', vscode.TreeItemCollapsibleState.None),
          new QualityItem('Retire.js', 'JavaScript library vulnerabilities', vscode.TreeItemCollapsibleState.None),
          new QualityItem('ESLint Security', 'Security-focused linting', vscode.TreeItemCollapsibleState.None)
        ]
      ),
      new QualityItem(
        'Testing Tools',
        'Run automated tests',
        vscode.TreeItemCollapsibleState.Expanded,
        [
          new QualityItem('Jest', 'Unit testing', vscode.TreeItemCollapsibleState.None),
          new QualityItem('Mocha', 'Test framework', vscode.TreeItemCollapsibleState.None),
          new QualityItem('Playwright', 'E2E testing', vscode.TreeItemCollapsibleState.None),
          new QualityItem('Cypress', 'E2E testing', vscode.TreeItemCollapsibleState.None)
        ]
      )
    ];
  }
}

export class QualityItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly description: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly children?: QualityItem[]
  ) {
    super(label, collapsibleState);
    this.tooltip = description;
    this.contextValue = children ? 'category' : 'tool';
    
    if (!children) {
      this.command = {
        command: 'quality-hub.runTool',
        title: 'Run Tool',
        arguments: [label.toLowerCase()]
      };
    }
  }
}
