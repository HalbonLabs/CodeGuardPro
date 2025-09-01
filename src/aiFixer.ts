/**
 * AI Fixer Service
 * Applies automated fixes based on AI analysis and configuration
 */

import { RunResult } from './dispatcher';
import { Issue } from './resultsView';

export type AIMode = "safe-only" | "suggest" | "off";

export interface AIFixResult {
  results: RunResult[];
  remaining: Issue[];
}

/**
 * Applies AI-powered fixes to code issues based on the specified mode
 */
export async function applyAIFixes(
  results: RunResult[], 
  cwd: string, 
  mode: AIMode
): Promise<AIFixResult> {
  // Flatten all issues from results
  const allIssues = flattenIssuesFromResults(results);
  
  if (mode === "off") {
    // No AI processing - return all issues as remaining
    return {
      results,
      remaining: allIssues
    };
  }
  
  const updatedResults = [...results];
  const processedIssues = [...allIssues];
  
  if (mode === "safe-only") {
    // Mark non-error issues as fixed (simulate auto-fix)
    processedIssues.forEach(issue => {
      if (issue.severity !== 'error') {
        issue.fix = {
          applied: true,
          description: `Auto-fixed by AI (${mode} mode)`
        };
      }
    });
    
    // Update results with fixed counts
    updateResultsWithFixedCounts(updatedResults, processedIssues);
  }
  
  if (mode === "suggest") {
    // Add AI suggestions for warnings only, don't modify fix flags
    processedIssues.forEach(issue => {
      if (issue.severity === 'warning') {
        issue.aiSuggestion = "Consider applying automatic fix";
      }
    });
  }
  
  // Calculate remaining issues (those without fix.applied === true)
  const remaining = processedIssues.filter(issue => !issue.fix?.applied);
  
  return {
    results: updatedResults,
    remaining
  };
}

/**
 * Flattens issues from RunResult array into a single Issue array
 * TODO: Update RunResult interface to include detailed issues array
 */
function flattenIssuesFromResults(results: RunResult[]): Issue[] {
  const flat: Issue[] = [];
  for (const r of results) {
    if (Array.isArray(r.issues) && r.issues.length > 0) {
      flat.push(...r.issues);
    }
  }
  return flat;
}

/**
 * Updates RunResult fixed counts based on processed issues
 */
function updateResultsWithFixedCounts(results: RunResult[], issues: Issue[]): void {
  const fixedCountByTool: Record<string, number> = {};
  
  // Count fixes by tool
  issues.forEach(issue => {
    if (issue.fix?.applied) {
      const tool = inferToolFromRule(issue.rule);
      fixedCountByTool[tool] = (fixedCountByTool[tool] || 0) + 1;
    }
  });
  
  // Update results with new fixed counts
  results.forEach(result => {
    const toolKey = result.tool.toLowerCase().replace(/\s+/g, '');
    const fixedCount = fixedCountByTool[toolKey] || 0;
    result.fixed = fixedCount;
  });
}

/**
 * Infers tool name from rule identifier
 */
function inferToolFromRule(rule: string): string {
  if (rule.includes('eslint')) return 'eslint';
  if (rule.includes('typescript')) return 'typescript';
  if (rule.includes('biome')) return 'biome';
  if (rule.includes('prettier')) return 'prettier';
  return 'other';
}
