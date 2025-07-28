import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

// Base interfaces for modular MCP components
export interface McpToolDefinition<TInput = any> {
  name: string;
  title: string;
  description: string;
  inputSchema: Record<string, any>;
  annotations?: {
    title?: string;
    readOnlyHint?: boolean;
    destructiveHint?: boolean;
    idempotentHint?: boolean;
    openWorldHint?: boolean;
  };
}

export interface McpTool<TInput = any, TOutput = any> {
  definition: McpToolDefinition<TInput>;
  handler: (params: TInput) => Promise<TOutput>;
}

export interface McpResourceDefinition {
  name: string;
  uri: string | ResourceTemplate;
  metadata: {
    title: string;
    description: string;
  };
}

export interface McpResource {
  definition: McpResourceDefinition;
  handler: (uri: string | URL, variables?: Record<string, any>) => Promise<{
    contents: Array<{
      uri: string;
      text: string;
      mimeType?: string;
    }>;
  }>;
}

export interface McpPromptDefinition<TArgs = any> {
  name: string;
  title: string;
  description: string;
  argsSchema: Record<string, z.ZodType>;
}

export interface McpPrompt<TArgs = any> {
  definition: McpPromptDefinition<TArgs>;
  handler: (args: TArgs) => Promise<any>;
}

// Registry types
export type ToolRegistry = Record<string, McpTool>;
export type ResourceRegistry = Record<string, McpResource>;
export type PromptRegistry = Record<string, McpPrompt>;