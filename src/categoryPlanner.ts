/**
 * Category Planning Service
 * Plans execution order and strategy for MCP tools within a category
 */

import { McpProvider, McpCapability } from './mcpDiscovery';

export interface MCPRequest {
  tool: string;
  command: string;
  cwd: string;
  args: Record<string, any>;
}

/**
 * Plans the execution strategy for a category of tools
 * @param providers Available MCP providers
 * @param category Category to plan for (e.g., "linting", "testing", "security")
 * @param cwd Current working directory for execution
 * @param enabledIds Tool IDs to include, or ["*"] for all discovered tools
 * @returns Array of MCPRequest objects in optimal execution order
 */
export function planCategory(
  providers: McpProvider[],
  category: string, 
  cwd: string,
  enabledIds: string[] | ["*"]
): MCPRequest[] {
  // Collect all capabilities matching the category
  const matchingCapabilities: Array<{
    capability: McpCapability;
    provider: McpProvider;
  }> = [];

  for (const provider of providers) {
    for (const capability of provider.capabilities) {
      if (capability.category === category) {
        matchingCapabilities.push({ capability, provider });
      }
    }
  }

  // Filter by enabled IDs if not wildcard
  const filteredCapabilities = enabledIds.includes("*") 
    ? matchingCapabilities
    : matchingCapabilities.filter(({ capability }) => 
        (enabledIds as string[]).includes(capability.id)
      );

  // Separate mutators and readers
  const mutators = filteredCapabilities.filter(({ capability }) => 
    capability.mutates === true
  );
  const readers = filteredCapabilities.filter(({ capability }) => 
    capability.mutates !== true
  );

  // Order: mutators first, then readers
  const orderedCapabilities = [...mutators, ...readers];

  // Build MCPRequest objects using the first command for each capability
  const requests: MCPRequest[] = orderedCapabilities.map(({ capability, provider }) => ({
    tool: capability.id,
    command: capability.commands[0], // Use first available command
    cwd,
    args: {
      // Default args - can be extended based on tool requirements
      workingDirectory: cwd,
      category
    }
  }));

  return requests;
}
