# CodeGuard MCP Runner

Experimental Model Context Protocol (MCP) task runner for code quality tools with AI-powered fixes.

## 🚀 Features

- **MCP Discovery**: Automatically discovers and connects to MCP servers
- **Category-based Execution**: Run tools by category (Linting, Testing, Security, Analysis, Dependencies)
- **Real-time Results**: Interactive results viewer with clickable file paths
- **AI Integration**: Ready for AI-powered fix suggestions
- **Fallback Support**: Works with or without MCP servers configured

## ⚙️ Configuration

Configure MCP servers in VS Code settings:

```json
{
  "codeguard-mcp.servers": [
    {
      "name": "ESLint MCP Server",
      "url": "http://localhost:3001",
      "token": "optional-auth-token"
    },
    {
      "name": "Security Scanner",
      "url": "https://security.example.com/mcp"
    }
  ]
}
```

## 🎯 Usage

1. **Configure MCP Servers**: Add your MCP server configurations in VS Code settings
2. **Run Categories**: Use commands or sidebar to run tool categories
3. **View Results**: Interactive results panel shows issues and fixes
4. **Export Data**: Export results to JSON for further analysis

## 📋 Commands

- `CodeGuard MCP: Run Linting` - Run linting and formatting tools
- `CodeGuard MCP: Run Testing` - Run testing tools
- `CodeGuard MCP: Run Security` - Run security analysis tools
- `CodeGuard MCP: Run Analysis` - Run complexity and code analysis tools
- `CodeGuard MCP: Run Dependencies` - Run dependency audit tools
- `CodeGuard MCP: Show Results` - Show last execution results
- `CodeGuard MCP: Undo Last Fix` - Restore files using git

## 🔧 MCP Server Requirements

Your MCP servers should support either:

1. **HTTP Endpoint**: `GET /capabilities` returning:
   ```json
   {
     "capabilities": {
       "tools": [
         {
           "name": "eslint",
           "description": "JavaScript/TypeScript linter"
         }
       ]
     }
   }
   ```

2. **MCP Discovery RPC**: JSON-RPC 2.0 `initialize` method

## 🆚 Differences from CodeGuard Pro

This experimental extension focuses specifically on MCP integration:

- ✅ MCP server discovery and communication
- ✅ Category-based tool execution
- ✅ Interactive results viewing
- ✅ Basic AI integration preparation
- ❌ No built-in local tools (MCP-first approach)
- ❌ Reduced UI complexity
- ❌ No API integrations (SonarQube, Codacy, etc.)

## 🚀 Installation

1. Package the extension: `npm run package`
2. Install the `.vsix` file in VS Code
3. Configure your MCP servers
4. Start using MCP-powered code quality tools!

## 🔄 Development

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch for changes
npm run watch

# Package extension
npm run package
```

## 📝 License

MIT License - See LICENSE file for details.
