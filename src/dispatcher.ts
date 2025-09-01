/**
 * Dispatcher Service
 * Executes planned MCP requests with optimal concurrency strategy
 */

import { MCPRequest } from './categoryPlanner';
import { normalize } from './normalizers';
import { runMCP } from './mcpClient';
import { Issue } from './resultsView';
import { runLocal } from './localTools';
import * as vscode from 'vscode';

export interface RunResult {
  tool: string;
  command: string;
  success: boolean;
  issues: Issue[];
  issueCount: number;  // For backward compatibility
  fixed: number;
  duration?: number; // Execution duration in milliseconds
  output?: string;
  error?: string;
  backend?: 'MCP' | 'IDE';
}

/**
 * Executes a single MCP request with fallback to local tools
 */
async function runOne(request: MCPRequest): Promise<RunResult> {
  const startTime = Date.now();
  let usedFallback = false;
  
  try {
    // Try MCP first
    const rawResponse = await runMCP(request);
    const duration = Date.now() - startTime;
    
    // Normalize response into standardized Issue objects
    const issues = normalize(request.tool, rawResponse);
    
    // Count fixed issues
    const fixedCount = issues.filter(issue => issue.fix?.applied).length;
    
    return {
      tool: request.tool,
      command: request.command,
      success: true,
      issues,
      issueCount: issues.length,
      fixed: fixedCount,
      duration,
      output: rawResponse.output || `Output from ${request.tool}`,
      backend: 'MCP'
    };
  } catch (mcpError) {
    // Check if fallback to local tools is preferred
    const config = vscode.workspace.getConfiguration("codeguard");
    const preferMCP = config.get<boolean>("execution.preferMCP") !== false; // Default to true

    // If MCP is preferred and failed, attempt local fallback
    if (preferMCP) {
      try {
        // Attempt fallback to local tool execution
        const rawResponse = await runLocal(request.tool, request.args, request.cwd);
        const duration = Date.now() - startTime;
        usedFallback = true;
        
        // Normalize response into standardized Issue objects
        let issues = normalize(request.tool, rawResponse);
        
        // Mark issues as coming from local execution
        issues = issues.map(issue => ({
          ...issue,
          message: `${issue.message} (local)`
        }));
        
        // Count fixed issues
        const fixedCount = issues.filter(issue => issue.fix?.applied).length;
        
        return {
          tool: request.tool,
          command: request.command,
          success: true,
          issues,
          issueCount: issues.length,
          fixed: fixedCount,
          duration,
          output: `${rawResponse.output || `Output from ${request.tool}`} (local fallback)`,
          backend: 'IDE'
        };
      } catch (localError) {
        // Both MCP and local execution failed
        const duration = Date.now() - startTime;
        
        return {
          tool: request.tool,
          command: request.command,
          success: false,
          issues: [],
          issueCount: 0,
          fixed: 0,
          duration,
          error: `MCP failed: ${mcpError instanceof Error ? mcpError.message : String(mcpError)}; Local fallback failed: ${localError instanceof Error ? localError.message : String(localError)}`,
          backend: 'MCP'
        };
      }
    } else {
      // MCP is not preferred; do not attempt fallback when MCP attempt fails
      const duration = Date.now() - startTime;
      
      return {
        tool: request.tool,
        command: request.command,
        success: false,
        issues: [],
        issueCount: 0,
        fixed: 0,
        duration,
        error: mcpError instanceof Error ? mcpError.message : String(mcpError),
        backend: 'MCP'
      };
    }
  }
}

/**
 * Executes a category plan with optimal concurrency strategy
 * Mutators run serially (to avoid conflicts), readers run in parallel
 * @param plan Array of MCPRequest objects to execute
 * @returns Promise resolving to array of RunResult objects
 */
export async function runCategoryPlan(plan: MCPRequest[]): Promise<RunResult[]> {
  const results: RunResult[] = [];
  
  // TODO: Implement proper mutator/reader detection
  // For now, assume all requests are mutators and run serially
  // This is safer but less performant than the optimal strategy
  
  // Optimal strategy would be:
  // 1. Identify mutators vs readers based on capability.mutates
  // 2. Run mutators serially to avoid file conflicts
  // 3. Run readers in parallel for better performance
  // 4. Handle dependencies between tools
  
  for (const request of plan) {
    const result = await runOne(request);
    results.push(result);
  }
  
  // TODO: Add result normalization
  // - Standardize issue formats across different tools
  // - Aggregate statistics (total issues, fixes, etc.)
  // - Handle tool-specific error codes and messages
  // - Generate unified reporting format
  
  return results;
}
