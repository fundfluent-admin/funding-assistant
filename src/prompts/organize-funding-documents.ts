import { z } from "zod";
import { TGetCheckFundingDocumentsPromptsParams } from "./check-funding-documents.js";
import { GetPromptResultSchema } from "@modelcontextprotocol/sdk/types.js";


export const GetOrganizeFundingDocumentsPromptsParamsSchema = z.object({
  fundingProgrammeName: z.string().describe('Name of the funding programme'),
});

export type TGetOrganizeFundingDocumentsPromptsParams = z.infer<typeof GetOrganizeFundingDocumentsPromptsParamsSchema>;

export async function getOrganizeFundingDocumentsPrompts(params: TGetCheckFundingDocumentsPromptsParams): Promise<z.infer<typeof GetPromptResultSchema>> {
  const { fundingProgrammeName } = params;

  return {
    messages: [
      {
        role: 'user',
        content: {
          type: "text",
          text: `Select the documents that matches the required documents and create a folder with the name of the funding programme (${fundingProgrammeName}). Copy the files inside and give meaningful filenames to the documents.`
        }
      },
    ]
  }
}