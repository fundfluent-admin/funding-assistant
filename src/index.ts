import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { GetAlertsTool } from './tools/get-alerts.js';
import { GetWeatherForecastTool } from './tools/get-forecast.js';

// Create server instance
const server = new McpServer({
  name: "weather",
  version: "1.0.0",
});

const tools = [
  new GetAlertsTool(),
  new GetWeatherForecastTool(),
]

// Register weather tools
async function registerTools(server: McpServer) {
  for (const tool of tools) tool.register(server);
}

async function main() {
  await registerTools(server);

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Weather MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
