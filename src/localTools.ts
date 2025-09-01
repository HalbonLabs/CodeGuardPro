/**
 * Local Tools Service
 * Executes local tool binaries when MCP is unavailable or fails
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { normalize } from './normalizers';
import { Issue } from './resultsView';

const execAsync = promisify(exec);

export type ToolId = string;

/**
 * Executes a local tool binary and returns normalized results
 */
export async function runLocal(tool: ToolId, args: any, cwd: string): Promise<any> {
  const command = buildLocalCommand(tool, args);
  
  if (!command) {
    throw new Error(`Local execution not supported for tool: ${tool}`);
  }

  try {
    const { stdout, stderr } = await execAsync(command, { 
      cwd,
      timeout: 60000, // 60 second timeout
      maxBuffer: 1024 * 1024 // 1MB buffer
    });

    // Parse tool-specific output formats
    const rawOutput = parseToolOutput(tool, stdout, stderr);
    
    return rawOutput;
  } catch (error: any) {
    // Handle tool execution errors
    if (error.code === 'ENOENT') {
      throw new Error(`Tool '${tool}' not found. Please install it first.`);
    }
    
    // Some tools return non-zero exit codes on lint errors (normal behavior)
    if (error.stdout || error.stderr) {
      const rawOutput = parseToolOutput(tool, error.stdout || '', error.stderr || '');
      return rawOutput;
    }
    
    throw error;
  }
}

/**
 * Builds the command line for local tool execution
 */
function buildLocalCommand(tool: ToolId, args: any): string | null {
  const toolLower = tool.toLowerCase();
  
  switch (toolLower) {
    case 'eslint':
      return 'npx eslint . --ext .ts,.js,.tsx,.jsx --format json';
    
    case 'biome':
      return 'npx @biomejs/biome check . --reporter json';
    
    case 'prettier':
      return 'npx prettier --check . --list-different';
    
    case 'typescript':
    case 'tsc':
      return 'npx tsc --noEmit --pretty false';
    
    case 'jest':
      return 'npx jest --json --passWithNoTests';
    
    case 'mocha':
      return 'npx mocha --reporter json';
    
    case 'vitest':
      return 'npx vitest run --reporter json';
    
    case 'npm-audit':
    case 'audit':
      return 'npm audit --json';
    
    case 'retire':
    case 'retirejs':
      return 'npx retire --outputformat json';
    
    case 'madge':
      return 'npx madge --circular --json .';
    
    case 'depcheck':
      return 'npx depcheck --json';
    
    default:
      return null; // Tool not supported for local execution
  }
}

/**
 * Parses tool-specific output formats into standardized format
 */
function parseToolOutput(tool: ToolId, stdout: string, stderr: string): any {
  const toolLower = tool.toLowerCase();
  
  try {
    switch (toolLower) {
      case 'eslint':
        return parseESLintOutput(stdout);
      
      case 'biome':
        return parseBiomeOutput(stdout);
      
      case 'prettier':
        return parsePrettierOutput(stdout, stderr);
      
      case 'typescript':
      case 'tsc':
        return parseTypeScriptOutput(stderr); // TSC outputs to stderr
      
      case 'jest':
      case 'mocha':
      case 'vitest':
        return parseTestOutput(stdout);
      
      case 'npm-audit':
      case 'audit':
        return parseAuditOutput(stdout);
      
      case 'retire':
      case 'retirejs':
        return parseRetireOutput(stdout);
      
      case 'madge':
        return parseMadgeOutput(stdout);
      
      case 'depcheck':
        return parseDepcheckOutput(stdout);
      
      default:
        return {
          success: true,
          output: stdout,
          error: stderr
        };
    }
  } catch (parseError) {
    // Fallback to raw output if parsing fails
    return {
      success: stdout.length > 0,
      output: stdout,
      error: stderr,
      parseError: parseError instanceof Error ? parseError.message : String(parseError)
    };
  }
}

/**
 * Parse ESLint JSON output
 */
function parseESLintOutput(stdout: string): any {
  const results = JSON.parse(stdout);
  
  if (!Array.isArray(results) || results.length === 0) {
    return { messages: [] };
  }

  // Flatten all messages from all files
  const allMessages = results.flatMap(file => 
    file.messages.map((msg: any) => ({
      ...msg,
      filePath: file.filePath
    }))
  );

  return {
    success: true,
    messages: allMessages,
    errorCount: results.reduce((sum, file) => sum + (file.errorCount || 0), 0),
    warningCount: results.reduce((sum, file) => sum + (file.warningCount || 0), 0)
  };
}

/**
 * Parse Biome JSON output
 */
function parseBiomeOutput(stdout: string): any {
  const result = JSON.parse(stdout);
  
  return {
    diagnostics: result.diagnostics || [],
    summary: {
      changed: result.summary?.changed || [],
      fixed: result.summary?.fixed || 0,
      errors: result.summary?.errors || 0
    }
  };
}

/**
 * Parse Prettier output (list of unformatted files)
 */
function parsePrettierOutput(stdout: string, stderr: string): any {
  const unformattedFiles = stdout.trim().split('\n').filter(line => line.trim());
  
  return {
    changed: false,
    files: unformattedFiles,
    summary: unformattedFiles.length > 0 ? 
      `${unformattedFiles.length} files need formatting` : 
      'All files are properly formatted'
  };
}

/**
 * Parse TypeScript compiler output
 */
function parseTypeScriptOutput(stderr: string): any {
  const lines = stderr.trim().split('\n');
  const diagnostics: any[] = [];
  
  // Parse TSC output format: "file(line,col): error TS#### message"
  lines.forEach(line => {
    const match = line.match(/^(.+?)\((\d+),(\d+)\):\s+(error|warning)\s+TS(\d+):\s+(.+)$/);
    if (match) {
      diagnostics.push({
        file: { fileName: match[1] },
        start: parseInt(match[2]) * 100 + parseInt(match[3]), // Rough position
        category: match[4],
        code: parseInt(match[5]),
        messageText: match[6]
      });
    }
  });

  return {
    diagnostics,
    errorCount: diagnostics.filter(d => d.category === 'error').length,
    warningCount: diagnostics.filter(d => d.category === 'warning').length
  };
}

/**
 * Parse test runner JSON output
 */
function parseTestOutput(stdout: string): any {
  const result = JSON.parse(stdout);
  
  return {
    testResults: {
      numTotalTests: result.numTotalTests || 0,
      numPassedTests: result.numPassedTests || 0,
      numFailedTests: result.numFailedTests || 0,
      testResults: result.testResults || []
    }
  };
}

/**
 * Parse npm audit JSON output
 */
function parseAuditOutput(stdout: string): any {
  const result = JSON.parse(stdout);
  
  return {
    vulnerabilities: result.vulnerabilities || {},
    metadata: result.metadata || {},
    auditReportVersion: result.auditReportVersion || 2
  };
}

/**
 * Parse retire.js JSON output
 */
function parseRetireOutput(stdout: string): any {
  const results = JSON.parse(stdout);
  
  return {
    vulnerabilities: results,
    summary: `Found ${results.length} potential vulnerabilities`
  };
}

/**
 * Parse madge circular dependency output
 */
function parseMadgeOutput(stdout: string): any {
  const result = JSON.parse(stdout);
  
  return {
    circular: result,
    summary: result.length > 0 ? 
      `Found ${result.length} circular dependencies` : 
      'No circular dependencies found'
  };
}

/**
 * Parse depcheck JSON output
 */
function parseDepcheckOutput(stdout: string): any {
  const result = JSON.parse(stdout);
  
  return {
    dependencies: result.dependencies || [],
    devDependencies: result.devDependencies || [],
    missing: result.missing || {},
    using: result.using || {}
  };
}
