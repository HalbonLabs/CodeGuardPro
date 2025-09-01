/**
 * Response Normalizers
 * Converts tool-specific response formats into standardized Issue objects
 */

import { Issue } from './resultsView';

/**
 * Normalizes tool responses into standardized Issue objects
 */
export function normalize(tool: string, raw: any): Issue[] {
  const issues: Issue[] = [];

  switch (tool.toLowerCase()) {
    case 'eslint':
      return normalizeESLint(raw);
    
    case 'biome':
      return normalizeBiome(raw);
    
    case 'prettier':
      return normalizePrettier(raw);
    
    case 'typescript':
    case 'tsc':
      return normalizeTypeScript(raw);
    
    case 'jest':
    case 'mocha':
    case 'vitest':
      return normalizeTestRunner(raw);
    
    default:
      return normalizeGeneric(tool, raw);
  }
}

/**
 * Normalizes ESLint response format
 */
function normalizeESLint(raw: any): Issue[] {
  if (!raw.messages || !Array.isArray(raw.messages)) {
    return [];
  }

  return raw.messages.map((msg: any) => ({
    file: msg.filePath || 'unknown',
    line: msg.line || 1,
    rule: msg.ruleId || 'eslint-rule',
    message: msg.message || 'ESLint issue detected',
    severity: msg.severity === 2 ? 'error' as const : 'warning' as const
  }));
}

/**
 * Normalizes Biome response format
 */
function normalizeBiome(raw: any): Issue[] {
  const issues: Issue[] = [];

  if (raw.diagnostics && Array.isArray(raw.diagnostics)) {
    raw.diagnostics.forEach((diagnostic: any) => {
      const isFormatting = diagnostic.category === 'format';
      
      issues.push({
        file: diagnostic.location?.path || 'src/index.ts',
        line: 1, // Biome formatting typically applies to whole file
        rule: `biome-${diagnostic.category}`,
        message: diagnostic.message || 'Formatting change applied',
        severity: diagnostic.severity === 'error' ? 'error' as const : 'info' as const,
        fix: isFormatting ? {
          applied: true,
          description: 'Biome formatting applied'
        } : undefined
      });
    });
  }

  return issues;
}

/**
 * Normalizes Prettier response format
 */
function normalizePrettier(raw: any): Issue[] {
  if (!raw.changed || !raw.files) {
    return [];
  }

  return raw.files.map((file: string) => ({
    file: file,
    line: 1,
    rule: 'prettier-format',
    message: 'formatted',
    severity: 'info' as const,
    fix: {
      applied: true,
      description: 'Prettier formatting applied'
    }
  }));
}

/**
 * Normalizes TypeScript compiler response format
 */
function normalizeTypeScript(raw: any): Issue[] {
  if (!raw.diagnostics || !Array.isArray(raw.diagnostics)) {
    return [];
  }

  return raw.diagnostics.map((diagnostic: any) => ({
    file: diagnostic.file?.fileName || 'unknown',
    line: diagnostic.start ? Math.floor(diagnostic.start / 100) : 1, // Rough line estimation
    rule: `typescript-${diagnostic.code}`,
    message: diagnostic.messageText || 'TypeScript error',
    severity: diagnostic.category === 'error' ? 'error' as const : 'warning' as const
  }));
}

/**
 * Normalizes test runner response format
 */
function normalizeTestRunner(raw: any): Issue[] {
  const issues: Issue[] = [];

  if (raw.testResults?.testResults && Array.isArray(raw.testResults.testResults)) {
    raw.testResults.testResults.forEach((test: any) => {
      if (test.status === 'failed') {
        issues.push({
          file: 'test/unknown.test.js', // Test files not specified in mock
          line: test.location?.line || 1,
          rule: 'test-failure',
          message: test.failureMessages?.[0] || `Test failed: ${test.title}`,
          severity: 'error' as const
        });
      }
    });
  }

  return issues;
}

/**
 * Normalizes generic tool response format
 */
function normalizeGeneric(tool: string, raw: any): Issue[] {
  // Handle generic responses that don't match specific tool formats
  if (raw.issues && Array.isArray(raw.issues)) {
    return raw.issues.map((issue: any) => ({
      file: issue.file || 'unknown',
      line: issue.line || 1,
      rule: issue.rule || `${tool}-rule`,
      message: issue.message || `Issue detected by ${tool}`,
      severity: issue.severity || 'warning' as const
    }));
  }

  // If no issues in response, return empty array
  return [];
}
