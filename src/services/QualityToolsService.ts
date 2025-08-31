// Quality Tools Service for CodeGuard Pro Extension
import * as vscode from 'vscode';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class QualityToolsService {
  constructor(private outputChannel: vscode.OutputChannel) {}

  /**
   * Common method to execute a command and handle success/error reporting
   */
  private async executeCommand(command: string, successMessage: string): Promise<string> {
    const { stdout, stderr } = await execAsync(command);
    const result = stdout || stderr;
    
    this.outputChannel.appendLine(`✅ ${successMessage}`);
    this.outputChannel.appendLine(result);
    
    return result;
  }

  async lintCode(targetPath: string, fix: boolean, tool: string): Promise<string> {
    this.outputChannel.appendLine(`Running ${tool} on ${targetPath}, fix: ${fix}`);
    
    try {
      let command = '';
      
      switch (tool) {
        case 'eslint':
          command = fix ? `npx eslint ${targetPath} --fix` : `npx eslint ${targetPath}`;
          break;
        case 'biome':
          command = fix ? `npx biome check ${targetPath} --apply` : `npx biome check ${targetPath}`;
          break;
        case 'prettier':
          command = fix ? `npx prettier --write ${targetPath}` : `npx prettier --check ${targetPath}`;
          break;
        default:
          throw new Error(`Unknown linting tool: ${tool}`);
      }

      return await this.executeCommand(command, `${tool} completed successfully`);
    } catch (error) {
      const errorMessage = `❌ ${tool} failed: ${error}`;
      this.outputChannel.appendLine(errorMessage);
      throw new Error(errorMessage);
    }
  }

  async runSecurityScan(targetPath: string, level: string, dependencies: boolean): Promise<string> {
    this.outputChannel.appendLine(`Running security scan on ${targetPath}, level: ${level}, deps: ${dependencies}`);
    
    try {
      const commands: string[] = [];
      
      if (dependencies) {
        commands.push('npm audit');
        commands.push('npx retire');
      }
      
      commands.push(`npx eslint ${targetPath} --ext .ts,.js -c .eslintrc.json`);
      
      const results: string[] = [];
      
      for (const command of commands) {
        try {
          const { stdout, stderr } = await execAsync(command);
          results.push(stdout || stderr);
        } catch (cmdError) {
          results.push(`Warning: ${command} failed - ${cmdError}`);
        }
      }
      
      const combinedResults = results.join('\n\n');
      this.outputChannel.appendLine('✅ Security scan completed');
      this.outputChannel.appendLine(combinedResults);
      
      return combinedResults;
    } catch (error) {
      const errorMessage = `❌ Security scan failed: ${error}`;
      this.outputChannel.appendLine(errorMessage);
      throw new Error(errorMessage);
    }
  }

  async runE2ETests(framework: string, spec: string, headless: boolean, browser: string): Promise<string> {
    this.outputChannel.appendLine(
      `Running E2E tests with ${framework}, spec: ${spec}, headless: ${headless}, browser: ${browser}`
    );
    
    try {
      let command = '';
      
      switch (framework) {
        case 'playwright':
          command = headless 
            ? `npx playwright test ${spec}` 
            : `npx playwright test ${spec} --headed`;
          break;
        case 'cypress':
          command = headless 
            ? `npx cypress run --spec "${spec}" --browser ${browser}` 
            : `npx cypress open --browser ${browser}`;
          break;
        case 'mocha':
          command = `npx mocha ${spec}`;
          break;
        default:
          throw new Error(`Unknown E2E framework: ${framework}`);
      }

      return await this.executeCommand(command, `E2E tests completed with ${framework}`);
    } catch (error) {
      const errorMessage = `❌ E2E tests failed with ${framework}: ${error}`;
      this.outputChannel.appendLine(errorMessage);
      throw new Error(errorMessage);
    }
  }

  dispose(): void {
    // Cleanup resources if needed
  }
}
