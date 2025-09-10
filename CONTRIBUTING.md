# Contributing to CodeGuard Pro

Thank you for your interest in contributing to CodeGuard Pro! We welcome contributions from the community.

## Development Setup

1. **Fork the repository**
2. **Clone your fork**:
   ```bash
   git clone https://github.com/your-username/quality-hub-vscode.git
   cd quality-hub-vscode
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Open in VS Code**:
   ```bash
   code .
   ```
5. **Start development**:
   - Press `F5` to launch the extension in a new Extension Development Host window
   - Make your changes in the main window
   - Reload the Extension Development Host window to test changes

## Project Structure

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

## Adding New Tools

To add a new quality tool:

1. **Add the tool to `QualityHubProvider.ts`**:

   ```typescript
   {
     name: "Tool Display Name",
     actualTool: "actual-tool-name",
     description: "What the tool does",
     icon: "vscode-icon-name",
     command: "quality-hub.newTool",
     category: "Appropriate Category"
   }
   ```

2. **Add command to `package.json`**:

   ```json
   {
     "command": "quality-hub.newTool",
     "title": "Tool Display Name",
     "category": "CodeGuard Pro",
     "icon": "$(icon-name)"
   }
   ```

3. **Implement the command in `extension.ts`**:

   ```typescript
   vscode.commands.registerCommand("quality-hub.newTool", () =>
     handleNewTool(qualityService),
   );
   ```

4. **Add the tool logic to `QualityToolsService.ts`**

## Code Style

- Use TypeScript for all code
- Follow the existing code style (ESLint configuration provided)
- Add JSDoc comments for public methods
- Use descriptive variable and function names

## Testing

- Test your changes in the Extension Development Host
- Ensure all existing functionality still works
- Test with different project types (JavaScript, TypeScript, etc.)

## Pull Request Process

1. **Create a feature branch**: `git checkout -b feature/your-feature-name`
2. **Make your changes**
3. **Test thoroughly**
4. **Commit with descriptive messages**:
   ```bash
   git commit -m "Add support for new tool X"
   ```
5. **Push to your fork**: `git push origin feature/your-feature-name`
6. **Create a Pull Request** with:
   - Clear description of changes
   - Screenshots if UI changes
   - Testing steps performed

## Issues and Feature Requests

- Use GitHub Issues for bug reports and feature requests
- Provide clear reproduction steps for bugs
- Include VS Code version, operating system, and extension version

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help newcomers to the project

## Questions?

Feel free to ask questions by creating an issue with the "question" label.

Thank you for contributing! 🚀
