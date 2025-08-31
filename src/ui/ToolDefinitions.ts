import { ToolInfo } from "./types";

export class ToolDefinitions {
  static getLintingTools(): ToolInfo[] {
    return [
      {
        id: "eslint",
        name: "ESLint",
        cmd: "quality-hub.eslintCode",
        desc: "Industry-standard JavaScript/TypeScript linting with extensive rule ecosystem and auto-fix capabilities.",
      },
      {
        id: "biome",
        name: "Biome",
        cmd: "quality-hub.biomeCode",
        desc: "Ultra-fast formatter, linter, and bundler for web projects. Combines the functionality of Prettier, ESLint, and more in a single tool.",
      },
      {
        id: "typescript-eslint",
        name: "TypeScript ESLint",
        cmd: "quality-hub.typescriptEslint",
        desc: "Specialized ESLint configuration for TypeScript projects. Provides type-aware linting rules and TypeScript-specific code quality checks.",
      },
      {
        id: "prettier",
        name: "Prettier",
        cmd: "quality-hub.prettier",
        desc: "Opinionated code formatter that enforces consistent style. Automatically formats code for readability and maintainability across your team.",
      },
      {
        id: "standardjs",
        name: "StandardJS",
        cmd: "quality-hub.standardjs",
        desc: "Zero-configuration JavaScript style guide and linter. Enforces consistent coding style without the need for configuration files.",
      },
    ];
  }

  static getSecurityTools(): ToolInfo[] {
    return [
      {
        id: "npm-audit",
        name: "npm audit",
        cmd: "quality-hub.npmAudit",
        desc: "Built-in npm security audit tool for identifying vulnerabilities in dependencies.",
      },
      {
        id: "eslint-security",
        name: "ESLint Security",
        cmd: "quality-hub.eslintSecurity",
        desc: "Security-focused ESLint rules to identify potential security vulnerabilities in JavaScript code.",
      },
      {
        id: "retire-js",
        name: "Retire.js",
        cmd: "quality-hub.retireJs",
        desc: "Scanner for identifying known vulnerabilities in JavaScript libraries and dependencies.",
      },
      {
        id: "audit-ci",
        name: "audit-ci",
        cmd: "quality-hub.auditCi",
        desc: "Audit your NPM dependencies in continuous integration environments with configurable thresholds.",
      },
      {
        id: "owasp-check",
        name: "OWASP Dependency Check",
        cmd: "quality-hub.owaspCheck",
        desc: "OWASP dependency check utility that identifies project dependencies and checks if there are any known, publicly disclosed, vulnerabilities.",
      },
    ];
  }

  static getTestingTools(): ToolInfo[] {
    return [
      {
        id: "playwright",
        name: "Playwright",
        cmd: "quality-hub.playwright",
        desc: "Modern end-to-end testing framework with support for multiple browsers, devices, and platforms.",
      },
      {
        id: "cypress",
        name: "Cypress",
        cmd: "quality-hub.cypress",
        desc: "JavaScript end-to-end testing framework with time-travel debugging and real-time browser testing.",
      },
      {
        id: "jest",
        name: "Jest",
        cmd: "quality-hub.jest",
        desc: "Delightful JavaScript testing framework with built-in mocking, assertion library, and code coverage reports.",
      },
      {
        id: "mocha",
        name: "Mocha",
        cmd: "quality-hub.mocha",
        desc: "Feature-rich JavaScript test framework running on Node.js and in the browser, making asynchronous testing simple.",
      },
      {
        id: "vitest",
        name: "Vitest",
        cmd: "quality-hub.vitest",
        desc: "A blazing fast unit test framework powered by Vite. Compatible with Jest APIs for easy migration.",
      },
      {
        id: "webdriverio",
        name: "WebdriverIO",
        cmd: "quality-hub.webdriverio",
        desc: "Next-gen browser and mobile automation test framework for Node.js with built-in test runner.",
      },
    ];
  }

  static getAnalysisTools(): ToolInfo[] {
    return [
      {
        id: "sonar-js",
        name: "SonarJS",
        cmd: "quality-hub.sonarJs",
        desc: "Static code analysis tool for JavaScript and TypeScript that detects bugs, vulnerabilities, and code smells.",
      },
      {
        id: "plato",
        name: "Plato",
        cmd: "quality-hub.plato",
        desc: "JavaScript source code visualization, static analysis, and complexity analysis tool with beautiful reports.",
      },
      {
        id: "eslint-complexity",
        name: "ESLint Complexity",
        cmd: "quality-hub.eslintComplexity",
        desc: "Measure and enforce cyclomatic complexity limits in your code. Helps identify overly complex functions that may be hard to maintain.",
      },
      {
        id: "duplicate-code",
        name: "Duplicate Code Detection",
        cmd: "quality-hub.duplicateCode",
        desc: "Find and report copy-pasted code blocks across your project. Helps identify refactoring opportunities and reduce technical debt.",
      },
      {
        id: "code-structure",
        name: "Code Structure Analysis",
        cmd: "quality-hub.codeStructure",
        desc: "Analyze project file structure, module organization, and architectural patterns. Provides insights into codebase organization and scalability.",
      },
    ];
  }

  static getDependencyTools(): ToolInfo[] {
    return [
      {
        id: "madge-deps",
        name: "Madge Dependencies",
        cmd: "quality-hub.madgeDeps",
        desc: "Detect circular dependencies and generate dependency graphs. Visualize module relationships and identify problematic dependency cycles.",
      },
      {
        id: "depcheck",
        name: "Depcheck",
        cmd: "quality-hub.depcheck",
        desc: "Find unused dependencies and missing dependencies in your project. Helps keep package.json clean and reduces bundle size.",
      },
      {
        id: "update-deps",
        name: "Update Dependencies",
        cmd: "quality-hub.updateDependencies",
        desc: "Check for available updates to project dependencies and get detailed upgrade information. Helps keep dependencies current and secure.",
      },
    ];
  }

  static getApiTools(): ToolInfo[] {
    return [
      {
        id: "sonarqube-api",
        name: "SonarQube API",
        cmd: "quality-hub.sonarQubeApi",
        desc: "Connect to SonarQube server for enterprise-grade code quality analysis. Push metrics and retrieve detailed quality gate results and project insights.",
      },
      {
        id: "codacy-api",
        name: "Codacy API",
        cmd: "quality-hub.codacyApi",
        desc: "Connect to Codacy platform for automated code review and quality analysis. Track code quality metrics and receive detailed improvement suggestions.",
      },
      {
        id: "codeclimate-api",
        name: "CodeClimate API",
        cmd: "quality-hub.codeClimateApi",
        desc: "Connect to CodeClimate for maintainability and test coverage analysis. Get actionable insights to improve code quality over time.",
      },
      {
        id: "snyk-api",
        name: "Snyk Code API",
        cmd: "quality-hub.snykCodeApi",
        desc: "Connect to Snyk security platform for vulnerability scanning and license compliance. Real-time security monitoring and fix recommendations.",
      },
      {
        id: "codefactor-api",
        name: "CodeFactor API",
        cmd: "quality-hub.codeFactorApi",
        desc: "Connect to CodeFactor for continuous code quality monitoring. Get real-time feedback on code changes and maintain quality standards.",
      },
    ];
  }
}
