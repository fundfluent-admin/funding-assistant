import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpResource } from "../types/mcp.js";
import { getDocumentChecklistForFundingProgramme } from "../tools/get-document-checklist-for-funding-programme.js";

export const fundingDocumentsResource: McpResource = {
  definition: {
    name: "funding-documents",
    uri: new ResourceTemplate("funding-documents://{slug}", { list: undefined }),
    metadata: {
      title: "Funding Programme Documents",
      description: "Direct access to comprehensive document checklists and requirements for specific funding programmes. Use the programme's slug identifier to retrieve detailed document requirements, eligibility criteria, and application guidelines. Essential for understanding what documents are needed before starting an application."
    }
  },
  
  handler: async (uri, variables) => {
    const slug = String(variables?.slug);
    const checklist = await getDocumentChecklistForFundingProgramme({ slug });
    
    if (checklist.isErr()) {
      // Error handling is done by middleware, just throw the original error
      throw checklist.error;
    }

    return {
      contents: [{
        uri: `funding-documents://${slug}`,
        text: JSON.stringify(checklist.value, null, 2),
        mimeType: "application/json"
      }]
    };
  }
};