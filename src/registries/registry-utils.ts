import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { 
  McpTool, 
  McpResource, 
  McpPrompt,
  ToolRegistry,
  ResourceRegistry,
  PromptRegistry
} from "../types/mcp.js";
import { 
  withErrorHandling, 
  withResourceErrorHandling, 
  withPromptErrorHandling 
} from "../utils/error-handler.js";

/**
 * Register all tools from a registry
 */
export const registerTools = (server: McpServer, tools: ToolRegistry) => {
  Object.values(tools).forEach(tool => {
    server.registerTool(
      tool.definition.name,
      {
        title: tool.definition.title,
        description: tool.definition.description,
        inputSchema: tool.definition.inputSchema,
        annotations: tool.definition.annotations
      },
      withErrorHandling(tool.handler, { toolName: tool.definition.name })
    );
  });
};

/**
 * Register all resources from a registry
 */
export const registerResources = (server: McpServer, resources: ResourceRegistry) => {
  Object.values(resources).forEach(resource => {
    const { name, uri, metadata } = resource.definition;
    
    if (typeof uri === 'string') {
      // Static resource URI
      server.registerResource(
        name,
        uri,
        metadata,
        withResourceErrorHandling(resource.handler, name)
      );
    } else {
      // ResourceTemplate
      server.registerResource(
        name,
        uri,
        metadata,
        withResourceErrorHandling(resource.handler, name)
      );
    }
  });
};

/**
 * Register all prompts from a registry
 */
export const registerPrompts = (server: McpServer, prompts: PromptRegistry) => {
  Object.values(prompts).forEach(prompt => {
    server.registerPrompt(
      prompt.definition.name,
      {
        title: prompt.definition.title,
        description: prompt.definition.description,
        argsSchema: prompt.definition.argsSchema
      },
      withPromptErrorHandling(prompt.handler, prompt.definition.name)
    );
  });
};

/**
 * Master registration function
 */
export const registerAll = (
  server: McpServer,
  registries: {
    tools?: ToolRegistry;
    resources?: ResourceRegistry;
    prompts?: PromptRegistry;
  }
) => {
  if (registries.tools) {
    registerTools(server, registries.tools);
  }
  
  if (registries.resources) {
    registerResources(server, registries.resources);
  }
  
  if (registries.prompts) {
    registerPrompts(server, registries.prompts);
  }
};