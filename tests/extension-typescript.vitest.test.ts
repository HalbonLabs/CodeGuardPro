// Advanced TypeScript tests for Quality Hub extension using Vitest
import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import fs from "fs";
import path from "path";

/* eslint-disable @typescript-eslint/no-unused-vars */

describe("Quality Hub Extension - TypeScript Vitest Tests", () => {
  const projectRoot = path.resolve(__dirname, "..");

  beforeAll(() => {
    console.log("Starting TypeScript Vitest tests...");
  });

  afterAll(() => {
    console.log("Completed TypeScript Vitest tests");
  });

  describe("Extension Configuration", () => {
    interface PackageJson {
      name: string;
      displayName: string;
      description: string;
      version: string;
      engines: {
        vscode: string;
      };
      contributes: {
        commands: Array<{
          command: string;
          title: string;
          category?: string;
        }>;
      };
      devDependencies: Record<string, string>;
      dependencies?: Record<string, string>;
      scripts: Record<string, string>;
    }

    it("should have valid package.json structure", () => {
      const packagePath = path.join(projectRoot, "package.json");
      expect(fs.existsSync(packagePath)).toBe(true);

      const packageJson: PackageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));
      expect(packageJson).toBeTypeOf("object");
      expect(packageJson.name).toBe("codeguard-pro");
      expect(packageJson.displayName).toBe("CodeGuard Pro");
    });

    it("should have all required dependencies", () => {
      const packagePath = path.join(projectRoot, "package.json");
      const packageJson: PackageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));

      const requiredDevDeps = ["vitest", "@vitest/ui", "typescript", "@types/vscode"];
      requiredDevDeps.forEach((dep) => {
        expect(packageJson.devDependencies[dep]).toBeDefined();
      });
    });

    it("should have proper VS Code command structure", () => {
      const packagePath = path.join(projectRoot, "package.json");
      const packageJson: PackageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));

      expect(packageJson.contributes).toBeTypeOf("object");
      expect(packageJson.contributes.commands).toBeInstanceOf(Array);

      const vitestCommand = packageJson.contributes.commands.find(
        (cmd) => cmd.command === "quality-hub.vitest",
      );

      expect(vitestCommand).toBeDefined();
      expect(vitestCommand!.title).toBe("Run Vitest Tests");
    });
  });

  describe("TypeScript Configuration", () => {
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

    it("should have valid tsconfig.json", () => {
      const tsconfigPath = path.join(projectRoot, "tsconfig.json");
      expect(fs.existsSync(tsconfigPath)).toBe(true);

      const tsconfig: TSConfig = JSON.parse(fs.readFileSync(tsconfigPath, "utf8"));
      expect(tsconfig).toBeTypeOf("object");
      expect(tsconfig.compilerOptions).toBeTypeOf("object");
    });

    it("should have proper compiler options", () => {
      const tsconfigPath = path.join(projectRoot, "tsconfig.json");
      const tsconfig: TSConfig = JSON.parse(fs.readFileSync(tsconfigPath, "utf8"));

      expect(["commonjs", "CommonJS"]).toContain(tsconfig.compilerOptions.module);
      expect(tsconfig.compilerOptions.target).toBeDefined();
      expect(tsconfig.compilerOptions.outDir).toBe("out");
      expect(tsconfig.compilerOptions.rootDir).toBe("src");
    });
  });

  describe("Vitest Configuration", () => {
    interface VitestConfig {
      test: {
        environment: string;
        include: string[];
        exclude: string[];
        setupFiles: string[];
        globals: boolean;
        testTimeout: number;
        coverage?: {
          provider: string;
          reporter: string[];
        };
      };
    }

    it("should have valid Vitest setup", () => {
      const vitestConfigPath = path.join(projectRoot, "vitest.config.ts");
      expect(fs.existsSync(vitestConfigPath)).toBe(true);

      const content = fs.readFileSync(vitestConfigPath, "utf8");
      expect(content).toContain("defineConfig");
      expect(content).toContain("environment: 'node'");
      expect(content).toContain("setupFiles: ['./vitest.setup.ts']");
    });

    it("should support TypeScript files", () => {
      const vitestConfigPath = path.join(projectRoot, "vitest.config.ts");
      const content = fs.readFileSync(vitestConfigPath, "utf8");

      expect(content).toContain("vitest.test.{js,ts}");
      expect(content).toContain("import path from 'path'");
    });
  });

  describe("Quality Tools Configuration", () => {
    it("should have ESLint configuration", () => {
      const eslintPath = path.join(projectRoot, ".eslintrc.json");
      expect(fs.existsSync(eslintPath)).toBe(true);

      const eslintConfig = JSON.parse(fs.readFileSync(eslintPath, "utf8"));
      expect(eslintConfig).toBeTypeOf("object");
    });

    it("should have Biome configuration", () => {
      const biomePath = path.join(projectRoot, "biome.json");
      expect(fs.existsSync(biomePath)).toBe(true);

      const biomeConfig = JSON.parse(fs.readFileSync(biomePath, "utf8"));
      expect(biomeConfig).toBeTypeOf("object");
    });

    it("should have audit-ci configuration", () => {
      const auditPath = path.join(projectRoot, "audit-ci.json");
      expect(fs.existsSync(auditPath)).toBe(true);

      const auditConfig = JSON.parse(fs.readFileSync(auditPath, "utf8"));
      expect(auditConfig).toBeTypeOf("object");
    });
  });

  describe("Service Type Safety", () => {
    interface MockService {
      lintCode: () => Promise<string>;
      runSecurityScan: () => Promise<string>;
      runE2ETests: () => Promise<string>;
      analyzeCodeQuality: () => Promise<string>;
      typeCheck: () => Promise<string>;
      analyzeDependencies: () => Promise<string>;
    }

    interface MockExtensionContext {
      subscriptions: any[];
      workspaceState: {
        get: (key: string) => any;
        update: (key: string, value: any) => Promise<void>;
      };
      globalState: {
        get: (key: string) => any;
        update: (key: string, value: any) => Promise<void>;
      };
      extensionPath: string;
      extensionUri: { fsPath: string };
    }

    it("should have properly typed mock service", () => {
      const mockService: MockService = (global as any).createMockService();
      expect(mockService).toBeDefined();
      expect(mockService.lintCode).toBeTypeOf("function");
      expect(mockService.runSecurityScan).toBeTypeOf("function");
      expect(mockService.runE2ETests).toBeTypeOf("function");
    });

    it("should handle extension context properly", () => {
      const mockContext: MockExtensionContext = (global as any).createMockExtensionContext();
      expect(mockContext).toBeDefined();
      expect(mockContext.subscriptions).toBeInstanceOf(Array);
      expect(mockContext.extensionPath).toBeTypeOf("string");
      expect(mockContext.workspaceState).toBeTypeOf("object");
      expect(mockContext.globalState).toBeTypeOf("object");
    });
  });

  describe("File Structure", () => {
    it("should have all required source files", () => {
      const requiredFiles = [
        "src/extension.ts",
        "src/services/QualityToolsService.ts",
        "src/ui/StatusBarManager.ts",
        "src/providers/QualityHubProvider.ts",
      ];

      requiredFiles.forEach((file) => {
        const filePath = path.join(projectRoot, file);
        expect(fs.existsSync(filePath), `${file} should exist`).toBe(true);
      });
    });

    it("should have configuration files", () => {
      const configFiles = [
        "tsconfig.json",
        ".eslintrc.json",
        "biome.json",
        "vitest.config.ts",
        "vitest.setup.ts",
      ];

      configFiles.forEach((file) => {
        const filePath = path.join(projectRoot, file);
        expect(fs.existsSync(filePath), `${file} should exist`).toBe(true);
      });
    });
  });

  describe("VS Code API Integration", () => {
    it("should have VS Code API available in tests", () => {
      expect((globalThis as any).vscode).toBeDefined();
      expect((globalThis as any).vscode.window).toBeDefined();
      expect((globalThis as any).vscode.commands).toBeDefined();
      expect((globalThis as any).vscode.workspace).toBeDefined();
    });

    it("should mock VS Code commands properly", () => {
      const commandId = "test.vitest.command";
      const handler = vi.fn();

      const result = (globalThis as any).vscode.commands.registerCommand(commandId, handler);
      expect(result).toBeDefined();
      expect(result.dispose).toBeTypeOf("function");
    });

    it("should mock VS Code window operations", () => {
      const message = "Vitest test message";
      const result = (globalThis as any).vscode.window.showInformationMessage(message);
      expect(result).toBeInstanceOf(Promise);
    });
  });
});
