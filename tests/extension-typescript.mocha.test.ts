import { describe, it, before, after } from "mocha";
import { expect } from "chai";
import * as fs from "fs";
import * as path from "path";

// Import types for VS Code extension testing
interface MockExtensionContext {
  subscriptions: any[];
  workspaceState: any;
  globalState: any;
  extensionPath: string;
}

interface MockQualityService {
  lintCode(targetPath: string, fix: boolean, tool: string): Promise<string>;
  runSecurityScan(targetPath: string, level: string, dependencies: boolean): Promise<string>;
  runE2ETests(framework: string, spec: string, headless: boolean, browser: string): Promise<string>;
}

describe("Quality Hub Extension - TypeScript Mocha Tests", function () {
  this.timeout(10000);

  const projectRoot = path.resolve(__dirname, "..");
  let mockService: MockQualityService;
  let mockContext: MockExtensionContext;

  before(function () {
    console.log("Starting TypeScript Mocha tests...");

    // Use global test utilities
    const globalAny = global as any;
    mockService = globalAny.testUtils.createMockService();
    mockContext = globalAny.testUtils.createMockExtensionContext();
  });

  after(function () {
    console.log("Completed TypeScript Mocha tests");
  });

  describe("Extension Configuration", function () {
    interface PackageJson {
      name: string;
      displayName: string;
      main: string;
      engines: { vscode: string };
      contributes: {
        commands: Array<{ command: string; title: string }>;
      };
      devDependencies: Record<string, string>;
    }

    let packageJson: PackageJson;

    before(function () {
      const packagePath = path.join(projectRoot, "package.json");
      packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8")) as PackageJson;
    });

    it("should have valid package.json structure", function () {
      expect(packageJson).to.be.an("object");
      expect(packageJson.name).to.equal("codeguard-pro");
      expect(packageJson.displayName).to.equal("CodeGuard Pro");
      expect(packageJson.main).to.equal("./out/simple-extension.js");
    });

    it("should have all required dependencies", function () {
      const requiredDevDeps = [
        "@types/mocha",
        "@types/node",
        "@types/vscode",
        "typescript",
        "mocha",
        "ts-node",
        "chai",
        "@types/chai",
      ];

      requiredDevDeps.forEach((dep) => {
        expect(packageJson.devDependencies).to.have.property(dep);
      });
    });

    it("should have proper VS Code command structure", function () {
      expect(packageJson.contributes.commands).to.be.an("array");

      const mochaCommand = packageJson.contributes.commands.find(
        (cmd) => cmd.command === "quality-hub.mocha",
      );

      expect(mochaCommand).to.exist;
      expect(mochaCommand!.title).to.equal("Run Mocha Tests");
    });
  });

  describe("TypeScript Configuration", function () {
    interface TSConfig {
      compilerOptions: {
        target: string;
        module: string;
        lib: string[];
        outDir: string;
        rootDir: string;
        strict: boolean;
        esModuleInterop: boolean;
        skipLibCheck: boolean;
        forceConsistentCasingInFileNames: boolean;
      };
      include: string[];
      exclude: string[];
    }

    it("should have valid tsconfig.json", function () {
      const tsconfigPath = path.join(projectRoot, "tsconfig.json");
      expect(fs.existsSync(tsconfigPath)).to.be.true;

      const tsconfig: TSConfig = JSON.parse(fs.readFileSync(tsconfigPath, "utf8"));
      expect(tsconfig).to.be.an("object");
      expect(tsconfig.compilerOptions).to.be.an("object");
    });

    it("should have proper compiler options", function () {
      const tsconfigPath = path.join(projectRoot, "tsconfig.json");
      const tsconfig: TSConfig = JSON.parse(fs.readFileSync(tsconfigPath, "utf8"));

      expect(tsconfig.compilerOptions.module).to.be.oneOf(["commonjs", "CommonJS"]);
      expect(tsconfig.compilerOptions.target).to.exist;
      expect(tsconfig.compilerOptions.outDir).to.equal("out");
      expect(tsconfig.compilerOptions.rootDir).to.equal("src");
    });
  });

  describe("Mocha Configuration", function () {
    interface MochaConfig {
      require: string[];
      extensions: string[];
      spec: string[];
      timeout: number;
      recursive: boolean;
      ui: string;
      reporter: string;
      exit: boolean;
      colors: boolean;
      bail: boolean;
    }

    it("should have valid Mocha setup", function () {
      const mochaConfigPath = path.join(projectRoot, ".mocharc.json");
      expect(fs.existsSync(mochaConfigPath)).to.be.true;

      const config: MochaConfig = JSON.parse(fs.readFileSync(mochaConfigPath, "utf8"));
      expect(config).to.be.an("object");
      expect(config.timeout).to.be.a("number");
      expect(config.spec).to.be.an("array");
      expect(config.require).to.include("./mocha.setup.js");
    });

    it("should support TypeScript files", function () {
      const mochaConfigPath = path.join(projectRoot, ".mocharc.json");
      const config: MochaConfig = JSON.parse(fs.readFileSync(mochaConfigPath, "utf8"));

      expect(config.extensions).to.include("ts");
      expect(config.require).to.include("ts-node/register");
    });
  });

  describe("Quality Tools Configuration", function () {
    it("should have ESLint configuration", function () {
      const eslintPath = path.join(projectRoot, ".eslintrc.json");
      expect(fs.existsSync(eslintPath)).to.be.true;

      const eslintConfig = JSON.parse(fs.readFileSync(eslintPath, "utf8"));
      expect(eslintConfig).to.be.an("object");
      expect(eslintConfig.parser).to.include("@typescript-eslint/parser");
    });

    it("should have Biome configuration", function () {
      const biomePath = path.join(projectRoot, "biome.json");
      expect(fs.existsSync(biomePath)).to.be.true;

      const biomeConfig = JSON.parse(fs.readFileSync(biomePath, "utf8"));
      expect(biomeConfig).to.be.an("object");
    });

    it("should have audit-ci configuration", function () {
      const auditCiPath = path.join(projectRoot, "audit-ci.json");
      expect(fs.existsSync(auditCiPath)).to.be.true;
    });
  });

  describe("Service Type Safety", function () {
    it("should have properly typed mock service", async function () {
      const lintResult: string = await mockService.lintCode(".", false, "eslint");
      expect(lintResult).to.be.a("string");

      const securityResult: string = await mockService.runSecurityScan(".", "high", true);
      expect(securityResult).to.be.a("string");

      const testResult: string = await mockService.runE2ETests("mocha", "*", true, "chrome");
      expect(testResult).to.be.a("string");
    });

    it("should handle extension context properly", function () {
      expect(mockContext.subscriptions).to.be.an("array");
      expect(mockContext.extensionPath).to.be.a("string");
      expect(mockContext.workspaceState).to.be.an("object");
      expect(mockContext.globalState).to.be.an("object");
    });
  });

  describe("File Structure", function () {
    it("should have all required source files", function () {
      const requiredFiles = [
        "src/extension.ts",
        "src/services/QualityToolsService.ts",
        "src/ui/StatusBarManager.ts",
        "src/providers/QualityHubProvider.ts",
      ];

      requiredFiles.forEach((file) => {
        const filePath = path.join(projectRoot, file);
        expect(fs.existsSync(filePath), `${file} should exist`).to.be.true;
      });
    });

    it("should have configuration files", function () {
      const configFiles = [
        "tsconfig.json",
        ".eslintrc.json",
        "biome.json",
        ".mocharc.json",
        "mocha.setup.js",
      ];

      configFiles.forEach((file) => {
        const filePath = path.join(projectRoot, file);
        expect(fs.existsSync(filePath), `${file} should exist`).to.be.true;
      });
    });
  });

  describe("VS Code API Integration", function () {
    it("should have VS Code API available in tests", function () {
      const globalAny = global as any;
      expect(globalAny.vscode).to.exist;
      expect(globalAny.vscode.window).to.exist;
      expect(globalAny.vscode.workspace).to.exist;
      expect(globalAny.vscode.commands).to.exist;
    });

    it("should mock VS Code commands properly", function () {
      const globalAny = global as any;
      const disposable = globalAny.vscode.commands.registerCommand("test.mocha.command", () => {
        return "mocha test result";
      });

      expect(disposable).to.be.an("object");
      expect(disposable.dispose).to.be.a("function");
    });

    it("should mock VS Code window operations", async function () {
      const globalAny = global as any;

      const infoResult = await globalAny.vscode.window.showInformationMessage("Mocha test message");
      expect(infoResult).to.be.undefined;

      const inputResult = await globalAny.vscode.window.showInputBox();
      expect(inputResult).to.equal("test-input");
    });
  });
});
