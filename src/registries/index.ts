import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerAll } from "./registry-utils.js";
import { toolRegistry } from "../tools/index.js";
import { resourceRegistry } from "../resources/index.js";
import { promptRegistry } from "../prompts-registry/index.js";

/**
 * Master registration function that registers all MCP components
 * This is the single entry point for registering tools, resources, and prompts
 */
export const registerAllComponents = (server: McpServer) => {
  registerAll(server, {
    tools: toolRegistry,
    resources: resourceRegistry,
    prompts: promptRegistry
  });
};

// Named exports for individual registries
export { toolRegistry, resourceRegistry, promptRegistry };