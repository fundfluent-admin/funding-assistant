import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpResource } from "../types/mcp.js";
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";

export const fundingTemplatesResource: McpResource = {
  definition: {
    name: "funding-templates",
    uri: new ResourceTemplate("funding-templates://{type}", { list: undefined }),
    metadata: {
      title: "Application Document Templates",
      description: "Pre-built document templates and frameworks for common funding application requirements. Includes business plan templates, financial projection formats, and project proposal structures. Helps standardize and streamline the application preparation process."
    }
  },
  
  handler: async (uri, variables) => {
    const type = String(variables?.type);
    
    // This is a placeholder implementation - in a real system you'd fetch actual templates
    const templates = {
      "business-plan": {
        title: "Business Plan Template",
        sections: [
          "Executive Summary",
          "Company Description",
          "Market Analysis",
          "Financial Projections",
          "Management Team"
        ],
        description: "Standard business plan template for funding applications"
      },
      "financial-projections": {
        title: "Financial Projections Template",
        sections: [
          "Revenue Forecast",
          "Expense Budget",
          "Cash Flow Statement",
          "Break-even Analysis"
        ],
        description: "Financial projections template for grant applications"
      },
      "project-proposal": {
        title: "Project Proposal Template", 
        sections: [
          "Project Overview",
          "Objectives and Goals",
          "Methodology",
          "Timeline",
          "Budget",
          "Expected Outcomes"
        ],
        description: "General project proposal template"
      }
    };

    const template = templates[type as keyof typeof templates];
    if (!template) {
      const availableTypes = Object.keys(templates);
      throw new McpError(
        ErrorCode.InvalidParams, 
        `Template type '${type}' not found`,
        { 
          type, 
          availableTypes 
        }
      );
    }

    return {
      contents: [{
        uri: `funding-templates://${type}`,
        text: JSON.stringify(template, null, 2),
        mimeType: "application/json"
      }]
    };
  }
};