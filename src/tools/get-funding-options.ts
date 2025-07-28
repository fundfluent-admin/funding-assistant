import { McpTool } from "../types/mcp.js";
import { FundingOptionQuerySchema, TFundingOptionQuery } from "../fluentlab/funding-option.js";
import { fluentLab } from "../fluentlab/index.js";

export const getFundingOptionsTool: McpTool<TFundingOptionQuery> = {
  definition: {
    name: 'get-funding-options',
    title: "Get Funding Options",
    description: "Retrieve available funding opportunities with detailed information including name and description. Use this tool when users need to explore available grants, funds, or financing opportunities. The results include program names, descriptions, eligibility criteria, and application details.",
    inputSchema: FundingOptionQuerySchema.shape,
    annotations: {
      title: "Funding Opportunities Search Engine",
      readOnlyHint: true,           // This tool only reads data, no modifications
      destructiveHint: false,       // No destructive operations performed
      idempotentHint: true,         // Same query parameters return identical results  
      openWorldHint: false          // Closed domain - limited to FluentLab's funding database
    }
  },
  
  handler: async (params) => {
    const fundingOptions = await fluentLab.fundingOption.getFundingOptions(params);

    if (fundingOptions.isOk()) {
      return {
        content: [
          { 
            type: 'text', 
            text: JSON.stringify(fundingOptions.value, null, 2), 
            mimeType: "application/json" 
          }
        ]
      };
    } else {
      // Error handling is now done by middleware, just throw the original error
      throw fundingOptions.error;
    }
  }
};