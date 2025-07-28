import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerAllComponents } from "./registries/index.js";

export const createServer = () => {
  const server = new McpServer({ 
    name: "@fluentlab/funding-assistant",
    title: 'Fluent Lab Funding Assistant',
    version: "1.0.0",
  });

  // Register all components with a single function call
  registerAllComponents(server);

  const cleanup = async () => {
    // Cleanup logic if needed
  };

  return { server, cleanup };
};
