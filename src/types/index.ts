import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export interface TTool {
  toolName: string;
  register: (server: McpServer) => void;
}
