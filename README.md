# Quality Hub

**Quality Hub** is a comprehensive VS Code extension that brings together all the essential code quality, security, and testing tools into one convenient interface. Stop switching between multiple extensions and terminal commands - manage your entire code quality workflow from a single sidebar panel.

## 🚀 Features

### 🎯 All-in-One Quality Dashboard

- **Dedicated Sidebar**: Custom activity bar icon for quick access
- **Organized Tools**: Categorized view of all quality tools
- **Real Tool Names**: See exactly which tools are being used (ESLint, Biome, Playwright, etc.)
- **Tool Descriptions**: Understand what each tool does before running it
- **🔥 Live API Integration**: Real connections to Codacy, SonarQube, CodeClimate, and more

### 🔧 Supported Tools

#### Linting & Code Style

- **ESLint**: Industry-standard JavaScript/TypeScript linting with extensive rule ecosystem
- **Biome**: Fast, modern alternative to ESLint + Prettier with zero-config setup
- Auto-fix capabilities for both tools

### Advanced Analysis

- **Code Metrics & Complexity**: Plato reports, cognitive complexity analysis
- **Duplicate Code Detection**: JSCPD integration for finding code duplication
- **Dependency Analysis**: Unused dependencies, vulnerability scanning, update checking
- **Code Structure Analysis**: Dependency graphs, circular dependency detection
- **SonarJS Integration**: Advanced code quality rules

### 🌐 Live API Integrations

- **Codacy API**: Real-time project analysis with quality grades and coverage metrics
- **SonarQube API**: Live quality gate status, bug counts, and technical debt
- **CodeClimate API**: Maintainability ratings and test coverage reporting
- **More APIs**: Snyk Code, CodeFactor (coming soon)

### Security & Compliance

- **Advanced Security Audit**: ESLint security plugin, Audit CI integration
- **Dependency Vulnerability Scanning**: Retire.js and npm audit
- **Security-focused Linting**: Specialized security rule sets

### Reporting & Insights

- **Quality Reports**: Generate comprehensive quality reports
- **Status Bar Integration**: Quick access to quality tools
- **Tree View Panel**: Organized quality actions in sidebar

## 📋 Commands

### Primary Commands

- `Quality Hub: Lint & Fix Code` - Run linting with automatic fixes
- `Quality Hub: Run Security Scan` - Check for security vulnerabilities
- `Quality Hub: Advanced Security Audit` - Comprehensive security analysis
- `Quality Hub: Run E2E Tests` - Execute end-to-end tests

### Analysis Commands

- `Quality Hub: Code Metrics & Complexity` - Detailed complexity analysis
- `Quality Hub: Find Duplicate Code` - Detect code duplication
- `Quality Hub: Analyze Dependencies` - Check unused/vulnerable dependencies
- `Quality Hub: Code Structure Analysis` - Dependency graphs and architecture
- `Quality Hub: Check Dependency Updates` - Find outdated packages

### Utility Commands

- `Quality Hub: Type Check` - Run TypeScript type checking
- `Quality Hub: Generate Quality Report` - Create detailed quality report
- `Quality Hub: Show Quality Panel` - Open the Quality Hub sidebar panel

## ⚙️ Configuration

Configure the extension through VS Code settings:

```json
{
  "quality-hub.enableStatusBar": true,
  "quality-hub.autoLintOnSave": false,
  "quality-hub.lintTool": "auto",
  "quality-hub.testFramework": "playwright",
  "quality-hub.duplicateCodeThreshold": 100,
  "quality-hub.complexityThreshold": 15,
  "quality-hub.enableSonarAnalysis": true,
  "quality-hub.securityLevel": "moderate"
}
```

### Configuration Options

- **enableStatusBar**: Show/hide status bar integration
- **autoLintOnSave**: Automatically lint code when files are saved
- **lintTool**: Choose between "auto", "biome", or "eslint"
- **testFramework**: Select from "playwright", "cypress", "selenium", "puppeteer"
- **duplicateCodeThreshold**: Minimum token count for duplicate detection
- **complexityThreshold**: Maximum cognitive complexity allowed
- **enableSonarAnalysis**: Enable/disable SonarJS analysis
- **securityLevel**: Security vulnerability threshold ("low", "moderate", "high", "critical")

## 🛠️ Integrated Tools

### Linting & Formatting

- **Biome**: Fast linter and formatter
- **ESLint**: Configurable JavaScript/TypeScript linter
- **JSHint**: JavaScript code quality tool

### Security Analysis

- **ESLint Security Plugin**: Security-focused linting rules
- **Retire.js**: Vulnerability scanning for JavaScript libraries
- **Audit CI**: Enhanced npm audit with CI integration
- **npm audit**: Built-in dependency vulnerability scanner

### Code Analysis

- **SonarJS**: Advanced code quality and complexity analysis
- **JSCPD**: Copy-paste detector for duplicate code
- **Plato**: Code complexity visualization
- **Madge**: Dependency graph analysis
- **Depcheck**: Unused dependency detection

### Testing & Utilities

- **Playwright**: Modern E2E testing framework
- **Cypress**: Developer-friendly E2E testing
- **npm-check-updates**: Dependency update checker
- **TypeScript**: Static type checking

## 📊 Quality Metrics

The extension tracks and reports on:

- **Code Complexity**: Cyclomatic and cognitive complexity
- **Code Coverage**: Test coverage metrics
- **Duplicate Code**: Percentage and locations of duplicated code
- **Dependencies**: Unused, outdated, and vulnerable packages
- **Security Issues**: Vulnerability count and severity
- **Type Safety**: TypeScript error count and types

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- VS Code

### Installation

1. Install the extension from VS Code marketplace
2. Open a project in VS Code
3. The Quality Hub panel will appear in the Explorer sidebar
4. Click any tool to start analysis

### Quick Start

1. **Open Command Palette** (`Ctrl+Shift+P`)
2. Search for "Quality Hub"
3. Run `Quality Hub: Lint & Fix Code` to start
4. Check the **Quality Hub panel** in Explorer for more tools
5. Monitor the **status bar** for quick access

## 📈 Development

### Project Structure

```
src/
├── extension.ts                 # Main extension entry point
├── services/
│   └── QualityToolsService.ts   # Core quality tools logic
├── providers/
│   └── QualityHubProvider.ts    # Tree view data provider
└── ui/
    └── StatusBarManager.ts      # Status bar integration
```

### Building

```bash
npm install          # Install dependencies
npm run compile      # Compile TypeScript
npm run watch        # Watch mode for development
npm run lint         # Run ESLint
```

### Configuration Files

- `.eslintrc.json`: Standard ESLint configuration
- `.eslintrc.security.json`: Security-focused ESLint rules
- `.eslintrc.sonar.json`: SonarJS quality rules
- `biome.json`: Biome linter and formatter settings
- `audit-ci.json`: Security audit configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🔧 Troubleshooting

### Common Issues

- **Tool not found**: Ensure Node.js is in your PATH
- **Permission errors**: Run VS Code as administrator if needed
- **Analysis timeout**: Increase timeout in extension settings
- **Memory issues**: Close other applications during large project analysis

### Support

- Create an issue on GitHub
- Check the Output panel for detailed error messages
- Consult the VS Code Developer Tools for debugging
