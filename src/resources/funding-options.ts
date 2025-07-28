import { McpResource } from "../types/mcp.js";
import { fluentLab } from "../fluentlab/index.js";

export const fundingOptionsResource: McpResource = {
  definition: {
    name: "funding-options",
    uri: "funding-options://list",
    metadata: {
      title: "Funding Options Directory",
      description: "Comprehensive directory of available funding opportunities including grants, loans, and investment programs. Provides essential information like programme names, descriptions, funding amounts, and eligibility requirements. Use this as the starting point to explore funding options."
    }
  },
  
  handler: async () => {
    const fundingOptions = await fluentLab.fundingOption.getFundingOptions({ page: 1, limit: 10 });
    
    if (fundingOptions.isErr()) {
      // Error handling is done by middleware, just throw the original error
      throw fundingOptions.error;
    }

    return {
      contents: [{
        uri: "funding-options://list",
        text: JSON.stringify(fundingOptions.value, null, 2),
        mimeType: "application/json"
      }]
    };
  }
};