import { PromptRegistry } from "../types/mcp.js";
import { checkFundingDocumentsPrompt } from "./check-funding-documents.js";
import { organizeFundingDocumentsPrompt } from "./organize-funding-documents.js";

// Export all prompts as a registry
export const promptRegistry: PromptRegistry = {
  [checkFundingDocumentsPrompt.definition.name]: checkFundingDocumentsPrompt,
  [organizeFundingDocumentsPrompt.definition.name]: organizeFundingDocumentsPrompt,
};

// Named exports for individual prompts
export { checkFundingDocumentsPrompt, organizeFundingDocumentsPrompt };