import { z } from "zod";
import { GetPromptResultSchema } from "@modelcontextprotocol/sdk/types.js";

export const GetCheckFundingDocumentsPromptsParamsSchema = z.object({
  fundingProgrammeName: z.string().describe('Name of the funding programme'),
});

export type TGetCheckFundingDocumentsPromptsParams = z.infer<typeof GetCheckFundingDocumentsPromptsParamsSchema>;

export async function getCheckFundingDocumentsPrompts(params: TGetCheckFundingDocumentsPromptsParams): Promise<z.infer<typeof GetPromptResultSchema>> {
  const { fundingProgrammeName } = params;

  return {
    messages: [
      {
        role: 'user',
        content: {
          type: "text",
          text: `Utilize the get-funding-option tool to retrieve the available funding options, look for the slug of the closest match to ${fundingProgrammeName}.\n
Then use the get-document-checklist-for-funding-programme tool to find the required documents for the programme.`
        }
      },
      {
        role: 'assistant',
        content: {
          type: "text",
          text: 'Do you want me to look at the content of the documents?'
        }
      },
      {
        role: 'user',
        content: {
          type: "text",
          text: 'No, only look at the filename of the documents. Do not get the content of the documents',
        }
      }
    ]
  }
}