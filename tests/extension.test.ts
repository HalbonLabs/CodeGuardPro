/**
 * Extension.test.ts
 * Unit tests for the main extension activation and deactivation
 */

describe("Quality Hub Extension Basic Tests", () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
  });

  describe("Extension Configuration", () => {
    it("should have valid package.json structure", () => {
      const packageJson = require("../package.json");

      expect(packageJson.name).toBe("quality-hub");
      expect(packageJson.main).toBe("./out/extension.js");
      expect(packageJson.engines.vscode).toBeDefined();
      expect(Array.isArray(packageJson.contributes.commands)).toBe(true);
      expect(packageJson.contributes.commands.length).toBeGreaterThan(0);
    });

    it("should have all required dependencies", () => {
      const packageJson = require("../package.json");

      expect(packageJson.dependencies.axios).toBeDefined();
      expect(packageJson.devDependencies.typescript).toBeDefined();
      expect(packageJson.devDependencies.jest).toBeDefined();
      expect(packageJson.devDependencies["@types/jest"]).toBeDefined();
    });

    it("should have proper VS Code command structure", () => {
      const packageJson = require("../package.json");
      const commands = packageJson.contributes.commands;

      // Find essential commands
      const showPanelCmd = commands.find(
        (cmd: any) => cmd.command === "qualityHub.showQualityPanel",
      );
      const eslintCmd = commands.find((cmd: any) => cmd.command === "qualityHub.runESLint");
      const jestCmd = commands.find((cmd: any) => cmd.command === "quality-hub.jest");

      expect(showPanelCmd).toBeDefined();
      expect(eslintCmd).toBeDefined();
      expect(jestCmd).toBeDefined();

      expect(showPanelCmd.title).toBe("Show Quality Panel");
      expect(eslintCmd.title).toBe("Run ESLint");
      expect(jestCmd.title).toBe("Run Jest Tests");
    });
  });

  describe("TypeScript Configuration", () => {
    it("should have valid tsconfig.json", () => {
      const tsconfig = require("../tsconfig.json");

      expect(tsconfig.compilerOptions).toBeDefined();
      expect(tsconfig.compilerOptions.target).toBe("ES2020");
      expect(tsconfig.compilerOptions.module).toBe("commonjs");
      expect(tsconfig.include).toContain("src/**/*");
    });
  });

  describe("Jest Configuration", () => {
    it("should have valid Jest setup", () => {
      const jestConfig = require("../jest.config.js");

      expect(jestConfig.preset).toBe("ts-jest");
      expect(jestConfig.testEnvironment).toBe("node");
      expect(Array.isArray(jestConfig.testMatch)).toBe(true);
      expect(jestConfig.testMatch.length).toBeGreaterThan(0);
    });
  });

  describe("Quality Tools Configuration", () => {
    it("should have ESLint configuration", () => {
      const eslintConfig = require("../.eslintrc.json");

      expect(eslintConfig.parser).toBe("@typescript-eslint/parser");
      expect(eslintConfig.plugins).toContain("@typescript-eslint");
      expect(eslintConfig.plugins).toContain("security");
    });

    it("should have Biome configuration", () => {
      const biomeConfig = require("../biome.json");

      expect(biomeConfig.linter.enabled).toBe(true);
      expect(biomeConfig.formatter.enabled).toBe(true);
    });

    it("should have audit-ci configuration", () => {
      const auditConfig = require("../audit-ci.json");

      expect(auditConfig.moderate).toBe(true);
      expect(auditConfig.high).toBe(true);
      expect(auditConfig.critical).toBe(true);
    });
  });

  describe("File Structure", () => {
    it("should have all required source files", () => {
      const fs = require("fs");
      const path = require("path");

      const requiredFiles = [
        "src/extension.ts",
        "src/services/QualityToolsService.ts",
        "src/ui/StatusBarManager.ts",
      ];

      requiredFiles.forEach((file) => {
        const filePath = path.join(__dirname, "..", file);
        expect(fs.existsSync(filePath)).toBe(true);
      });
    });

    it("should have configuration files", () => {
      const fs = require("fs");
      const path = require("path");

      const configFiles = [
        "package.json",
        "tsconfig.json",
        ".eslintrc.json",
        "biome.json",
        "jest.config.js",
      ];

      configFiles.forEach((file) => {
        const filePath = path.join(__dirname, "..", file);
        expect(fs.existsSync(filePath)).toBe(true);
      });
    });
  });
});
