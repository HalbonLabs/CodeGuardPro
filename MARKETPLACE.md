# Publishing to VS Code Marketplace

This guide will help you publish the CodeGuard Pro extension to the VS Code Marketplace.

## Prerequisites

1. **Microsoft Account**: You need a Microsoft account to access Azure DevOps
2. **Azure DevOps Organization**: Create one if you don't have it
3. **Personal Access Token**: Generate a token with Marketplace access
4. **vsce CLI Tool**: Install the Visual Studio Code Extension Manager

## Setup

### 1. Install vsce

```bash
npm install -g vsce
```

### 2. Create Azure DevOps Personal Access Token

1. Go to [Azure DevOps](https://dev.azure.com)
2. Click on your profile picture → "Personal access tokens"
3. Click "New Token"
4. Name: "VS Code Marketplace"
5. Organization: Select your organization
6. Scopes: Custom defined → Marketplace → Manage
7. Click "Create"
8. **Save the token securely!**

### 3. Login to vsce

```bash
vsce login your-publisher-name
```

Enter your Personal Access Token when prompted.

## Before Publishing

### 1. Add an Icon

Create a 128x128 pixel PNG icon and save it as `resources/icon.png`. The icon should:

- Be clearly visible on both light and dark backgrounds
- Represent code quality/analysis
- Be professional looking

### 2. Update Publisher Information

In `package.json`, update the publisher field:

```json
{
  "publisher": "your-actual-publisher-name"
}
```

### 3. Set Repository URLs

Update the repository URLs to your actual GitHub repository:

```json
{
  "repository": {
    "type": "git",
    "url": "https://github.com/your-username/quality-hub-vscode"
  },
  "homepage": "https://github.com/your-username/quality-hub-vscode#readme",
  "bugs": {
    "url": "https://github.com/your-username/quality-hub-vscode/issues"
  }
}
```

### 4. Test the Extension

1. Press `F5` in VS Code to launch in development mode
2. Test all features to ensure they work correctly
3. Check that the sidebar icon appears and functions properly

## Publishing Steps

### 1. Package the Extension

```bash
vsce package
```

This creates a `.vsix` file that you can test by installing manually:

```bash
code --install-extension quality-hub-1.0.0.vsix
```

### 2. Publish to Marketplace

```bash
vsce publish
```

Or to publish a specific version:

```bash
vsce publish major  # Increments major version
vsce publish minor  # Increments minor version
vsce publish patch  # Increments patch version
```

### 3. Verify Publication

1. Go to [VS Code Marketplace](https://marketplace.visualstudio.com/vscode)
2. Search for "CodeGuard Pro"
3. Verify your extension appears and information is correct

## Post-Publication

### 1. Update Documentation

- Add marketplace badge to README
- Update installation instructions
- Share on social media/developer communities

### 2. Monitor and Maintain

- Monitor downloads and ratings
- Respond to user feedback
- Publish updates regularly

## Marketplace Badge

Add this badge to your README after publishing:

```markdown
[![Visual Studio Marketplace](https://img.shields.io/visual-studio-marketplace/v/your-publisher.quality-hub)](https://marketplace.visualstudio.com/items?itemName=your-publisher.quality-hub)
[![Downloads](https://img.shields.io/visual-studio-marketplace/d/your-publisher.quality-hub)](https://marketplace.visualstudio.com/items?itemName=your-publisher.quality-hub)
```

## Troubleshooting

### Common Issues

1. **Publisher not found**: Ensure you've created a publisher in the marketplace
2. **Token expired**: Generate a new Personal Access Token
3. **Icon missing**: Add a 128x128 PNG icon to `resources/icon.png`
4. **Package validation failed**: Check all required fields in `package.json`

### Useful Commands

```bash
vsce ls                    # List published extensions
vsce show publisher-name   # Show extension details
vsce unpublish            # Unpublish extension (use carefully!)
```

## Next Steps

After successful publication:

1. **Promote your extension** in developer communities
2. **Gather user feedback** and iterate
3. **Plan future features** based on user needs
4. **Consider GitHub Sponsors** for sustainability

Good luck with your extension! 🚀
