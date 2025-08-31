# Changelog

All notable changes to the Quality Hub extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-08-30

### Added

- **Dedicated Sidebar**: Custom activity bar icon with organized tool categories
- **Real Tool Names**: Display actual tool names (ESLint, Biome, Playwright, etc.) instead of generic names
- **Tool Descriptions**: Detailed descriptions of what each tool does
- **Categorized View**: Tools organized by category (Linting, Security, Testing, etc.)
- **Marketplace Ready**: Complete package.json with publisher info, icon, and gallery banner
- **Comprehensive Documentation**: Updated README with screenshots and detailed usage instructions

### Enhanced

- **Tree View Provider**: Restructured to show categories and actual tool information
- **User Experience**: Better tooltips and descriptions for each tool
- **Package Metadata**: Added proper marketplace information for publication

### Technical

- **Activity Bar Integration**: Custom view container for dedicated sidebar presence
- **View Registration**: Updated view IDs and container configuration
- **Extension Metadata**: Added repository URLs, license, and author information

### Tools Integrated

- **ESLint / Biome**: Code linting and formatting
- **npm audit / Snyk**: Security vulnerability scanning
- **Retire.js / OWASP**: Advanced security auditing
- **Playwright**: End-to-end testing
- **SonarJS / Plato**: Code quality analysis
- **TypeScript Compiler**: Type checking
- **JSCPD**: Duplicate code detection
- **Madge / Depcheck**: Dependency analysis
- **npm-check-updates**: Dependency update checking

## [0.0.1] - Initial Release

### Added

- Basic extension structure
- Core quality tools integration
- Status bar functionality
- Command palette integration
- Configuration options
