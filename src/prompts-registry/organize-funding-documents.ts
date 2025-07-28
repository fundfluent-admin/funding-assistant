import { z } from "zod";
import { McpPrompt } from "../types/mcp.js";
import { 
  getOrganizeFundingDocumentsPrompts,
  GetOrganizeFundingDocumentsPromptsParamsSchema 
} from "../prompts/organize-funding-documents.js";

export const organizeFundingDocumentsPrompt: McpPrompt = {
  definition: {
    name: 'organize-funding-documents',
    title: "Organize Funding Documents", 
    description: "Interactive workflow to help organize and structure documents for a funding programme application. This prompt provides guidance on document organization, naming conventions, and preparation strategies. Use this when users need help systematically preparing their application materials.",
    argsSchema: {
      fundingProgrammeName: z.string().describe("The name or partial name of the funding programme to organize documents for")
    }
  },
  
  handler: async ({ fundingProgrammeName }) => {
    const params = GetOrganizeFundingDocumentsPromptsParamsSchema.parse({ fundingProgrammeName });
    return await getOrganizeFundingDocumentsPrompts(params);
  }
};