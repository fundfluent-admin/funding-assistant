import { z } from "zod";
import { McpPrompt } from "../types/mcp.js";
import { 
  getCheckFundingDocumentsPrompts,
  GetCheckFundingDocumentsPromptsParamsSchema 
} from "../prompts/check-funding-documents.js";

export const checkFundingDocumentsPrompt: McpPrompt = {
  definition: {
    name: 'check-funding-documents',
    title: "Check Funding Documents",
    description: "Interactive workflow to check if you have sufficient documents for applying to a specific funding programme. This prompt guides you through identifying the funding program and verifying document requirements. Use this when users need assistance validating their application readiness.",
    argsSchema: {
      fundingProgrammeName: z.string().describe("The name or partial name of the funding programme to check documents for")
    }
  },
  
  handler: async ({ fundingProgrammeName }) => {
    const params = GetCheckFundingDocumentsPromptsParamsSchema.parse({ fundingProgrammeName });
    return await getCheckFundingDocumentsPrompts(params);
  }
};