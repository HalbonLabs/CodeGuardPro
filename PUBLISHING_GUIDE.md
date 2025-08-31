# Quality Hub v1.0.0 Publishing Guide

## VS Code Marketplace Publishing

### Prerequisites
1. Create a publisher account at https://marketplace.visualstudio.com/manage
2. Generate a Personal Access Token (PAT) from Azure DevOps
3. Install vsce globally: `npm install -g vsce`

### Publishing Steps
```bash
# Login to VS Code Marketplace
vsce login quality-hub

# Publish to marketplace
vsce publish

# Or publish specific version
vsce publish 1.0.0
```

## GitHub Repository Setup

### Create GitHub Repository
1. Create repository: https://github.com/qualityhub/vscode-quality-hub
2. Add repository as remote:
```bash
git remote add origin https://github.com/qualityhub/vscode-quality-hub.git
git branch -M main
git push -u origin main
```

### Create GitHub Release
1. Go to GitHub Releases
2. Create new release with tag `v1.0.0`
3. Upload the `quality-hub-1.0.0.vsix` file
4. Add release notes

## NPM Publishing (Optional - for CLI tools)

Note: VS Code extensions don't typically need npm publishing.
If you want to publish tools separately:

```bash
# For scoped package
npm publish --access public

# Check package
npm view @qualityhub/vscode-extension
```

## Manual Distribution

### Direct Installation
Users can install the VSIX file directly:
```bash
code --install-extension quality-hub-1.0.0.vsix
```

### Website Distribution
Host the VSIX file on your website for direct download.

## Version Management

### Increment Version
```bash
# Patch version (1.0.1)
vsce publish patch

# Minor version (1.1.0)  
vsce publish minor

# Major version (2.0.0)
vsce publish major
```

## Files Ready for Distribution

- `quality-hub-1.0.0.vsix` - Main extension package
- `README.md` - Comprehensive documentation
- `CHANGELOG.md` - Version history
- `LICENSE` - MIT license
- All source code committed to git

## Quality Assurance Checklist

✅ All 25 tools have timestamp tracking
✅ Extension compiles without errors
✅ Package.json metadata complete
✅ README documentation comprehensive
✅ Git repository initialized and committed
✅ VSIX package created successfully
✅ License file included
✅ Contributing guidelines provided

## Next Actions Required

1. **Create GitHub repository** at github.com/qualityhub/vscode-quality-hub
2. **Push code to GitHub**
3. **Set up VS Code Marketplace publisher account**
4. **Publish to VS Code Marketplace**
5. **Create GitHub release with VSIX attachment**
