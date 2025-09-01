/**
 * MCP (Model Context Protocol) Discovery Service
 * Handles discovery and management of MCP providers for code quality tools
 */

import * as vscode from 'vscode';
import * as https from 'https';
import * as http from 'http';

export interface McpCapability {
  id: string;
  category: string;
  mutates?: boolean;
  commands: string[];
}

export interface McpProvider {
  name: string;
  capabilities: McpCapability[];
  run(capId: string, command: string, args: any): Promise<any>;
}

export interface McpServerConfig {
  name: string;
  url: string;
  token?: string;
}

interface McpCapabilityResponse {
  capabilities?: {
    tools?: Array<{
      name: string;
      description?: string;
      inputSchema?: any;
    }>;
    resources?: Array<{
      uri: string;
      name: string;
      description?: string;
      mimeType?: string;
    }>;
  };
}

/**
 * Discovers available MCP providers and their capabilities
 * @returns Promise resolving to array of available MCP providers
 */
export async function discover(): Promise<McpProvider[]> {
  const providers: McpProvider[] = [];
  
  // Get MCP server configurations from VS Code settings
  const config = vscode.workspace.getConfiguration('codeguard-mcp');
  const servers: McpServerConfig[] = config.get('servers', []);
  
  if (servers.length === 0) {
    vscode.window.showInformationMessage(
      'No MCP servers configured. Using fallback providers.',
      'Configure Servers'
    ).then(selection => {
      if (selection === 'Configure Servers') {
        vscode.commands.executeCommand('workbench.action.openSettings', 'codeguard-mcp.servers');
      }
    });
    
    // Return minimal mock provider so UI still works
    return getMockProviders();
  }

  // Discover capabilities from each configured server
  const discoveryPromises = servers.map(server => discoverServerCapabilities(server));
  const results = await Promise.allSettled(discoveryPromises);
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value) {
      providers.push(result.value);
    } else {
      const server = servers[index];
      console.warn(`Failed to discover capabilities from MCP server "${server.name}":`, 
        result.status === 'rejected' ? result.reason : 'Unknown error');
      vscode.window.showWarningMessage(
        `MCP server "${server.name}" is not responding. Check server configuration.`
      );
    }
  });

  // If no providers were discovered, return mock providers as fallback
  if (providers.length === 0) {
    vscode.window.showWarningMessage(
      'No MCP servers are responding. Using fallback providers.'
    );
    return getMockProviders();
  }

  return providers;
}

/**
 * Discovers capabilities from a single MCP server
 */
async function discoverServerCapabilities(server: McpServerConfig): Promise<McpProvider | null> {
  try {
    const capabilities = await queryServerCapabilities(server);
    
    if (!capabilities || !capabilities.capabilities) {
      console.warn(`MCP server "${server.name}" returned invalid capabilities response`);
      return null;
    }

    const mcpCapabilities = mapServerCapabilities(capabilities, server.name);
    
    return {
      name: server.name,
      capabilities: mcpCapabilities,
      run: async (capId: string, command: string, args: any) => {
        return executeServerCommand(server, capId, command, args);
      }
    };
  } catch (error) {
    console.error(`Error discovering capabilities for MCP server "${server.name}":`, error);
    throw error;
  }
}

/**
 * Queries MCP server for its capabilities
 */
async function queryServerCapabilities(server: McpServerConfig): Promise<McpCapabilityResponse | null> {
  return new Promise((resolve, reject) => {
    const url = new URL(server.url);
    const isHttps = url.protocol === 'https:';
    const httpModule = isHttps ? https : http;
    
    // Try /capabilities endpoint first, then fallback to MCP discovery RPC
    const capabilitiesPath = url.pathname.endsWith('/') 
      ? `${url.pathname}capabilities` 
      : `${url.pathname}/capabilities`;
    
    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: capabilitiesPath,
      method: 'GET',
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'CodeGuard MCP VS Code Extension',
        ...(server.token && { 'Authorization': `Bearer ${server.token}` })
      }
    };

    const req = httpModule.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const response = JSON.parse(data);
            resolve(response);
          } else if (res.statusCode === 404) {
            // Try MCP discovery RPC as fallback
            tryMcpDiscoveryRpc(server).then(resolve).catch(reject);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        } catch (parseError) {
          reject(new Error(`Failed to parse response: ${parseError}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Request failed: ${error.message}`));
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Request timeout after 5s`));
    });

    req.end();
  });
}

/**
 * Fallback to MCP discovery RPC if /capabilities endpoint is not available
 */
async function tryMcpDiscoveryRpc(server: McpServerConfig): Promise<McpCapabilityResponse | null> {
  return new Promise((resolve, reject) => {
    const url = new URL(server.url);
    const isHttps = url.protocol === 'https:';
    const httpModule = isHttps ? https : http;
    
    const rpcPayload = {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {}
        },
        clientInfo: {
          name: 'CodeGuard MCP',
          version: '0.1.0'
        }
      }
    };

    const postData = JSON.stringify(rpcPayload);
    
    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname,
      method: 'POST',
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'CodeGuard MCP VS Code Extension',
        ...(server.token && { 'Authorization': `Bearer ${server.token}` })
      }
    };

    const req = httpModule.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const response = JSON.parse(data);
            if (response.result && response.result.capabilities) {
              resolve({ capabilities: response.result.capabilities });
            } else {
              resolve(null);
            }
          } else {
            reject(new Error(`MCP RPC failed with HTTP ${res.statusCode}: ${data}`));
          }
        } catch (parseError) {
          reject(new Error(`Failed to parse MCP RPC response: ${parseError}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`MCP RPC request failed: ${error.message}`));
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`MCP RPC timeout after 5s`));
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Maps server capabilities response to our McpCapability format
 */
function mapServerCapabilities(response: McpCapabilityResponse, serverName: string): McpCapability[] {
  const capabilities: McpCapability[] = [];
  
  if (response.capabilities?.tools) {
    response.capabilities.tools.forEach(tool => {
      const category = inferCategoryFromTool(tool.name, tool.description);
      
      capabilities.push({
        id: tool.name,
        category: category,
        mutates: inferMutatesFromTool(tool.name, tool.description),
        commands: [tool.name] // Default to tool name as command
      });
    });
  }
  
  // If no tools found, create a default capability based on server name
  if (capabilities.length === 0) {
    const category = inferCategoryFromServerName(serverName);
    capabilities.push({
      id: serverName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      category: category,
      mutates: true,
      commands: ['run']
    });
  }
  
  return capabilities;
}

/**
 * Executes a command on the MCP server
 */
async function executeServerCommand(
  server: McpServerConfig, 
  capId: string, 
  command: string, 
  args: any
): Promise<any> {
  // TODO: Implement actual MCP command execution
  // This would send the command to the server and return results
  console.log(`Executing MCP command: ${command} on ${server.name} with capability ${capId}`);
  
  // For now, return a mock response
  return {
    success: true,
    issues: [],
    fixed: 0,
    message: `Executed ${command} on ${server.name}`
  };
}

/**
 * Infers tool category from tool name and description
 */
function inferCategoryFromTool(name: string, description?: string): string {
  const lowerName = name.toLowerCase();
  const lowerDesc = (description || '').toLowerCase();
  
  if (lowerName.includes('lint') || lowerDesc.includes('lint')) return 'linting';
  if (lowerName.includes('format') || lowerDesc.includes('format')) return 'formatting';
  if (lowerName.includes('test') || lowerDesc.includes('test')) return 'testing';
  if (lowerName.includes('security') || lowerDesc.includes('security')) return 'security';
  if (lowerName.includes('dependency') || lowerDesc.includes('dependency')) return 'dependencies';
  if (lowerName.includes('complexity') || lowerDesc.includes('complexity')) return 'analysis';
  if (lowerName.includes('duplicate') || lowerDesc.includes('duplicate')) return 'analysis';
  
  return 'analysis';
}

/**
 * Infers if tool mutates code from name and description
 */
function inferMutatesFromTool(name: string, description?: string): boolean {
  const lowerName = name.toLowerCase();
  const lowerDesc = (description || '').toLowerCase();
  
  if (lowerName.includes('format') || lowerDesc.includes('format')) return true;
  if (lowerName.includes('fix') || lowerDesc.includes('fix')) return true;
  if (lowerName.includes('auto') || lowerDesc.includes('auto')) return true;
  
  return false;
}

/**
 * Infers category from server name
 */
function inferCategoryFromServerName(serverName: string): string {
  const lowerName = serverName.toLowerCase();
  
  if (lowerName.includes('eslint') || lowerName.includes('lint')) return 'linting';
  if (lowerName.includes('prettier') || lowerName.includes('format')) return 'formatting';
  if (lowerName.includes('test') || lowerName.includes('jest')) return 'testing';
  if (lowerName.includes('security') || lowerName.includes('audit')) return 'security';
  if (lowerName.includes('dep') || lowerName.includes('npm')) return 'dependencies';
  
  return 'analysis';
}

/**
 * Returns mock providers for fallback when no servers are configured or responding
 */
function getMockProviders(): McpProvider[] {
  return [
    {
      name: "mock-eslint",
      capabilities: [
        {
          id: "eslint",
          category: "linting",
          mutates: true,
          commands: ["lint", "fix"]
        }
      ],
      run: async (capId: string, command: string, args: any) => {
        return { 
          success: true, 
          issues: [], 
          fixed: 0,
          message: "Mock ESLint execution (configure real MCP servers in settings)"
        };
      }
    },
    {
      name: "mock-prettier",
      capabilities: [
        {
          id: "prettier",
          category: "formatting",
          mutates: true,
          commands: ["format"]
        }
      ],
      run: async (capId: string, command: string, args: any) => {
        return { 
          success: true, 
          issues: [], 
          fixed: 0,
          message: "Mock Prettier execution (configure real MCP servers in settings)"
        };
      }
    }
  ];
}
