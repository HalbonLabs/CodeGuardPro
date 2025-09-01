# Installation Guide for CodeGuard MCP

## 📦 Quick Install

The extension has been packaged as `codeguard-mcp-0.1.0.vsix` and is ready for installation!

## 🚀 Installation Steps

### Option 1: Command Line Install
```bash
code --install-extension codeguard-mcp-0.1.0.vsix
```

### Option 2: VS Code UI Install
1. Open VS Code
2. Go to Extensions panel (Ctrl+Shift+X)
3. Click the "..." menu in the top right
4. Select "Install from VSIX..."
5. Browse to `codeguard-mcp-0.1.0.vsix`
6. Click "Install"

## ⚙️ Post-Installation Setup

1. **Configure MCP Servers** (Optional):
   - Open VS Code Settings (Ctrl+,)
   - Search for "codeguard-mcp"
   - Add your MCP server configurations:
   ```json
   {
     "codeguard-mcp.servers": [
       {
         "name": "Local ESLint Server",
         "url": "http://localhost:3001"
       }
     ]
   }
   ```

2. **Test the Extension**:
   - Open the Command Palette (Ctrl+Shift+P)
   - Type "CodeGuard MCP"
   - Try "CodeGuard MCP: Run Linting"
   - Check the sidebar "CodeGuard MCP" panel

## 🎯 First Test

1. The extension will work even without MCP servers (uses fallback providers)
2. Run any category command to see the results viewer
3. Check the sidebar for the tree view of categories
4. Try the export functionality

## 🔧 If Issues Occur

1. **Check the Developer Console**:
   - Help → Toggle Developer Tools
   - Look for "CodeGuard MCP" logs

2. **Verify Installation**:
   - Go to Extensions panel
   - Search for "CodeGuard MCP"
   - Should show as installed

3. **Restart VS Code** if needed

## 🆚 Running Alongside CodeGuard Pro

This MCP extension can run alongside the main CodeGuard Pro extension:
- Different command prefixes (`codeguard-mcp.` vs `codeguard.`)
- Separate settings namespace
- Independent functionality
- Uses different sidebar panel name

## 📋 Quick Test Commands

Once installed, try these commands:
- `CodeGuard MCP: Run Linting`
- `CodeGuard MCP: Run Security`
- `CodeGuard MCP: Show Results`

The extension will show mock results even without real MCP servers configured!
