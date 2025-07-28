import { ToolRegistry } from "../types/mcp.js";
import { getFundingOptionsTool } from "./get-funding-options.js";

// Export all tools as a registry
export const toolRegistry: ToolRegistry = {
  [getFundingOptionsTool.definition.name]: getFundingOptionsTool,
};

// Named exports for individual tools
export { getFundingOptionsTool };