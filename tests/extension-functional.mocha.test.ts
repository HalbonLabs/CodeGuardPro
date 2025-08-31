// Comprehensive Mocha tests for CodeGuard Pro Extension functionality
import { describe, it, before, after } from "mocha";
import { expect } from "chai";
import * as fs from "fs";
import * as path from "path";

describe("CodeGuard Pro Extension - Functional Mocha Tests", function () {
  this.timeout(15000);

  const projectRoot = path.resolve(process.cwd());
  let mockService: any;
  let mockContext: any;

  before(function () {
    console.log("🚀 Starting CodeGuard Pro functional tests...");
    const globalAny = global as any;
    mockService = globalAny.testUtils.createMockService();
    mockContext = globalAny.testUtils.createMockExtensionContext();
  });

  after(function () {
    console.log("✅ Completed CodeGuard Pro functional tests");
  });

  describe("Quality Analysis Tools", function () {
    describe("ESLint Integration", function () {
      it("should execute ESLint analysis successfully", async function () {
        const result = await mockService.lintCode("./src", false, "eslint");
        
        expect(result).to.be.a("string");
        expect(result).to.include("eslint");
        expect(result).to.include("./src");
        expect(result).to.include("fix: false");
      });

      it("should support ESLint auto-fix mode", async function () {
        const result = await mockService.lintCode("./src", true, "eslint");
        
        expect(result).to.include("fix: true");
      });

      it("should validate ESLint configuration exists", function () {
        const eslintConfigPath = path.join(projectRoot, ".eslintrc.json");
        expect(fs.existsSync(eslintConfigPath)).to.be.true;
        
        const config = JSON.parse(fs.readFileSync(eslintConfigPath, "utf8"));
        expect(config.parser).to.equal("@typescript-eslint/parser");
        expect(config.plugins).to.include("@typescript-eslint");
        expect(config.plugins).to.include("security");
      });
    });

    describe("Biome Integration", function () {
      it("should execute Biome analysis successfully", async function () {
        const result = await mockService.lintCode("./src", false, "biome");
        
        expect(result).to.be.a("string");
        expect(result).to.include("biome");
        expect(result).to.include("./src");
      });

      it("should support Biome auto-fix mode", async function () {
        const result = await mockService.lintCode("./src", true, "biome");
        
        expect(result).to.include("fix: true");
      });

      it("should validate Biome configuration", function () {
        const biomeConfigPath = path.join(projectRoot, "biome.json");
        expect(fs.existsSync(biomeConfigPath)).to.be.true;
        
        const config = JSON.parse(fs.readFileSync(biomeConfigPath, "utf8"));
        expect(config).to.have.property("linter");
        expect(config).to.have.property("formatter");
      });
    });

    describe("Prettier Integration", function () {
      it("should execute Prettier formatting", async function () {
        const result = await mockService.lintCode("./src", false, "prettier");
        
        expect(result).to.be.a("string");
        expect(result).to.include("prettier");
      });

      it("should support Prettier write mode", async function () {
        const result = await mockService.lintCode("./src", true, "prettier");
        
        expect(result).to.include("fix: true");
      });
    });
  });

  describe("Security Analysis Tools", function () {
    describe("npm audit", function () {
      it("should run dependency security scan", async function () {
        const result = await mockService.runSecurityScan(".", "moderate", true);
        
        expect(result).to.be.a("string");
        expect(result).to.include("level: moderate");
        expect(result).to.include("deps: true");
      });

      it("should support different security levels", async function () {
        const highResult = await mockService.runSecurityScan(".", "high", true);
        const lowResult = await mockService.runSecurityScan(".", "low", true);
        
        expect(highResult).to.include("level: high");
        expect(lowResult).to.include("level: low");
      });
    });

    describe("Retire.js Integration", function () {
      it("should scan for JavaScript vulnerabilities", async function () {
        const result = await mockService.runSecurityScan("./src", "moderate", false);
        
        expect(result).to.be.a("string");
        expect(result).to.include("./src");
        expect(result).to.include("deps: false");
      });
    });

    describe("ESLint Security Plugin", function () {
      it("should run security-focused linting", async function () {
        const result = await mockService.runSecurityScan("./src", "high", false);
        
        expect(result).to.include("Security scan");
        expect(result).to.include("./src");
      });
    });
  });

  describe("Testing Framework Integration", function () {
    describe("Mocha Tests", function () {
      it("should execute Mocha test suite", async function () {
        const result = await mockService.runE2ETests("mocha", "tests/**/*.mocha.test.*", true, "");
        
        expect(result).to.be.a("string");
        expect(result).to.include("mocha");
        expect(result).to.include("tests/**/*.mocha.test.*");
        expect(result).to.include("headless: true");
      });

      it("should validate Mocha configuration", function () {
        const mochaConfigPath = path.join(projectRoot, ".mocharc.json");
        expect(fs.existsSync(mochaConfigPath)).to.be.true;
        
        const config = JSON.parse(fs.readFileSync(mochaConfigPath, "utf8"));
        expect(config.require).to.include("ts-node/register");
        expect(config.require).to.include("./mocha.setup.js");
        expect(config.extensions).to.include("ts");
      });
    });

    describe("Playwright Integration", function () {
      it("should execute Playwright tests in headless mode", async function () {
        const result = await mockService.runE2ETests("playwright", "tests/e2e/", true, "chromium");
        
        expect(result).to.include("playwright");
        expect(result).to.include("headless: true");
        expect(result).to.include("browser: chromium");
      });

      it("should execute Playwright tests in headed mode", async function () {
        const result = await mockService.runE2ETests("playwright", "tests/e2e/", false, "firefox");
        
        expect(result).to.include("headless: false");
        expect(result).to.include("browser: firefox");
      });
    });

    describe("Cypress Integration", function () {
      it("should execute Cypress tests", async function () {
        const result = await mockService.runE2ETests("cypress", "cypress/e2e/**/*.cy.js", true, "chrome");
        
        expect(result).to.include("cypress");
        expect(result).to.include("browser: chrome");
      });
    });
  });

  describe("Extension Architecture", function () {
    describe("Service Layer", function () {
      it("should have QualityToolsService available", function () {
        const servicePath = path.join(projectRoot, "src/services/QualityToolsService.ts");
        expect(fs.existsSync(servicePath)).to.be.true;
        
        const serviceContent = fs.readFileSync(servicePath, "utf8");
        expect(serviceContent).to.include("class QualityToolsService");
        expect(serviceContent).to.include("lintCode");
        expect(serviceContent).to.include("runSecurityScan");
        expect(serviceContent).to.include("runE2ETests");
      });

      it("should have StatusBarManager for UI", function () {
        const statusBarPath = path.join(projectRoot, "src/ui/StatusBarManager.ts");
        expect(fs.existsSync(statusBarPath)).to.be.true;
        
        const statusBarContent = fs.readFileSync(statusBarPath, "utf8");
        expect(statusBarContent).to.include("class StatusBarManager");
        expect(statusBarContent).to.include("updateStatusBar");
        expect(statusBarContent).to.include("setRunning");
        expect(statusBarContent).to.include("setIdle");
      });

      it("should have QualityHubProvider for tree view", function () {
        const providerPath = path.join(projectRoot, "src/providers/QualityHubProvider.ts");
        expect(fs.existsSync(providerPath)).to.be.true;
        
        const providerContent = fs.readFileSync(providerPath, "utf8");
        expect(providerContent).to.include("class QualityHubProvider");
        expect(providerContent).to.include("TreeDataProvider");
        expect(providerContent).to.include("getTreeItem");
        expect(providerContent).to.include("getChildren");
      });
    });

    describe("Extension Entry Points", function () {
      it("should have main extension file", function () {
        const mainExtPath = path.join(projectRoot, "src/simple-extension.ts");
        expect(fs.existsSync(mainExtPath)).to.be.true;
      });

      it("should have legacy extension compatibility", function () {
        const legacyExtPath = path.join(projectRoot, "src/extension.ts");
        expect(fs.existsSync(legacyExtPath)).to.be.true;
        
        const legacyContent = fs.readFileSync(legacyExtPath, "utf8");
        expect(legacyContent).to.include("export * from './simple-extension'");
      });

      it("should have compiled JavaScript output", function () {
        const outPath = path.join(projectRoot, "out");
        expect(fs.existsSync(outPath)).to.be.true;
        
        const compiledMain = path.join(outPath, "simple-extension.js");
        expect(fs.existsSync(compiledMain)).to.be.true;
        
        const compiledLegacy = path.join(outPath, "extension.js");
        expect(fs.existsSync(compiledLegacy)).to.be.true;
      });
    });
  });

  describe("Configuration Management", function () {
    describe("Package Configuration", function () {
      it("should have comprehensive command definitions", function () {
        const packagePath = path.join(projectRoot, "package.json");
        const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));
        
        const commands = packageJson.contributes.commands;
        const commandIds = commands.map((cmd: any) => cmd.command);
        
        expect(commandIds).to.include("quality-hub.eslintCode");
        expect(commandIds).to.include("quality-hub.biomeCode");
        expect(commandIds).to.include("quality-hub.npmAudit");
        expect(commandIds).to.include("quality-hub.playwright");
        expect(commandIds).to.include("quality-hub.cypress");
        expect(commandIds).to.include("quality-hub.jest");
        expect(commandIds).to.include("quality-hub.mocha");
      });

      it("should have proper activation events", function () {
        const packagePath = path.join(projectRoot, "package.json");
        const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));
        
        expect(packageJson.activationEvents).to.include("onStartupFinished");
        expect(packageJson.activationEvents).to.include("onView:quality-hub.sidebarView");
      });

      it("should have sidebar view configuration", function () {
        const packagePath = path.join(projectRoot, "package.json");
        const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));
        
        expect(packageJson.contributes.views).to.have.property("quality-hub-webview");
        expect(packageJson.contributes.viewsContainers).to.have.property("activitybar");
      });
    });

    describe("TypeScript Configuration", function () {
      it("should have proper compiler options", function () {
        const tsconfigPath = path.join(projectRoot, "tsconfig.json");
        const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, "utf8"));
        
        expect(tsconfig.compilerOptions.module).to.equal("commonjs");
        expect(tsconfig.compilerOptions.target).to.equal("ES2020");
        expect(tsconfig.compilerOptions.outDir).to.equal("out");
        expect(tsconfig.compilerOptions.rootDir).to.equal("src");
        expect(tsconfig.compilerOptions.strict).to.be.true;
        expect(tsconfig.compilerOptions.isolatedModules).to.be.true;
      });
    });
  });

  describe("VS Code API Mocking", function () {
    it("should have VS Code window API mocked", function () {
      const globalAny = global as any;
      expect(globalAny.vscode.window).to.exist;
      expect(globalAny.vscode.window.showInformationMessage).to.be.a("function");
      expect(globalAny.vscode.window.showErrorMessage).to.be.a("function");
      expect(globalAny.vscode.window.createStatusBarItem).to.be.a("function");
    });

    it("should have VS Code workspace API mocked", function () {
      const globalAny = global as any;
      expect(globalAny.vscode.workspace).to.exist;
      expect(globalAny.vscode.workspace.getConfiguration).to.be.a("function");
      expect(globalAny.vscode.workspace.workspaceFolders).to.be.an("array");
    });

    it("should have VS Code commands API mocked", function () {
      const globalAny = global as any;
      expect(globalAny.vscode.commands).to.exist;
      expect(globalAny.vscode.commands.registerCommand).to.be.a("function");
      expect(globalAny.vscode.commands.executeCommand).to.be.a("function");
    });

    it("should properly mock extension context", function () {
      expect(mockContext).to.exist;
      expect(mockContext.subscriptions).to.be.an("array");
      expect(mockContext.extensionPath).to.be.a("string");
      expect(mockContext.workspaceState).to.be.an("object");
      expect(mockContext.globalState).to.be.an("object");
    });
  });

  describe("Error Handling", function () {
    it("should handle invalid tool names gracefully", async function () {
      try {
        await mockService.lintCode("./src", false, "invalid-tool");
        expect.fail("Should have thrown an error for invalid tool");
      } catch (error: any) {
        expect(error.message).to.include("linting tool");
      }
    });

    it("should handle invalid framework names gracefully", async function () {
      try {
        await mockService.runE2ETests("invalid-framework", "tests/", true, "chrome");
        expect.fail("Should have thrown an error for invalid framework");
      } catch (error: any) {
        expect(error.message).to.include("E2E framework");
      }
    });
  });

  describe("Performance Validation", function () {
    it("should complete linting operations within reasonable time", async function () {
      this.timeout(5000);
      
      const startTime = Date.now();
      await mockService.lintCode("./src", false, "eslint");
      const endTime = Date.now();
      
      const duration = endTime - startTime;
      expect(duration).to.be.lessThan(1000); // Should complete within 1 second for mock
    });

    it("should handle concurrent operations", async function () {
      const operations = [
        mockService.lintCode("./src", false, "eslint"),
        mockService.lintCode("./src", false, "biome"),
        mockService.runSecurityScan(".", "moderate", true)
      ];
      
      const results = await Promise.all(operations);
      
      expect(results).to.have.length(3);
      results.forEach(result => {
        expect(result).to.be.a("string");
      });
    });
  });
});
