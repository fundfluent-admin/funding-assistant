import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  GetPromptRequestSchema,
  GetPromptResultSchema,
  ListPromptsRequestSchema,
  ListPromptsResultSchema,
  ListToolsRequestSchema,
  Tool,
  ToolSchema
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import {
  getDocumentChecklistForFundingProgramme,
  GetDocumentChecklistForFundingProgrammeSchema
} from "./tools/get-document-checklist-for-funding-programme.js";
import { FundingOptionQuerySchema } from "./fluentlab/funding-option.js";
import { fluentLab } from "./fluentlab/index.js";
import {
  getCheckFundingDocumentsPrompts,
  GetCheckFundingDocumentsPromptsParamsSchema
} from "./prompts/check-funding-documents.js";
import {
  getOrganizeFundingDocumentsPrompts,
  GetOrganizeFundingDocumentsPromptsParamsSchema
} from "./prompts/organize-funding-documents.js";

const ToolInputSchema = ToolSchema.shape.inputSchema;
type ToolInput = z.infer<typeof ToolInputSchema>;

const ToolName = {
  GetFundingOptions: 'get-funding-options',
  GetDocumentChecklistForFundingProgramme: 'get-document-checklist-for-funding-programme'
} as const;

const PromptName = {
  CheckFundingDocument: 'check-funding-documents',
  OrganizeFundingDocument: 'organize-funding-documents',
} as const;

export const createServer = () => {
  const server = new Server(
    {
      name: "@fluentlab/funding-assistant",
      version: "1.0.0",
    },
    {
      capabilities: {
        prompts: {},
        // resources: { subscribe: true },
        tools: {},
        // logging: {},
      },
    },
  );

  server.setRequestHandler(ListPromptsRequestSchema, async (): Promise<z.infer<typeof ListPromptsResultSchema>> => {
    return {
      prompts: [
        {
          name: PromptName.CheckFundingDocument,
          description: 'Check for sufficient documents for applying a funding programme',
          arguments: [
            {
              name: 'fundingProgrammeName',
              description: 'Name of a funding programme',
            }
          ],
        },
        {
          name: PromptName.OrganizeFundingDocument,
          description: 'Organize the documents for a funding programme',
          arguments: [
            {
              name: 'fundingProgrammeName',
              description: 'Name of a funding programme',
            }
          ],
        }
      ]
    };
  });

  server.setRequestHandler(GetPromptRequestSchema, async (request: z.infer<typeof GetPromptRequestSchema>): Promise<z.infer<typeof GetPromptResultSchema>> => {
    const { name, arguments: args } = request.params;

    if (name === PromptName.CheckFundingDocument) {
      const params = GetCheckFundingDocumentsPromptsParamsSchema.parse(args);

      return await getCheckFundingDocumentsPrompts(params);
    }

    if (name === PromptName.OrganizeFundingDocument) {
      const params = GetOrganizeFundingDocumentsPromptsParamsSchema.parse(args);

      return await getOrganizeFundingDocumentsPrompts(params);
    }

   throw new Error(`Failed to retrieve prompt ${name}`)
  });

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    const tools: Tool[] = [
      {
        name: ToolName.GetFundingOptions,
        description: 'Get funding options available including name, description and slug defined by FluentLab',
        inputSchema: zodToJsonSchema(FundingOptionQuerySchema) as ToolInput,
      },
      {
        name: 'get-document-checklist-for-funding-programme',
        description: "Gets the comprehensive document checklist of a funding programme by funding option slug",
        inputSchema: zodToJsonSchema(GetDocumentChecklistForFundingProgrammeSchema) as ToolInput,
      },
    ];

    return { tools };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    if (name === ToolName.GetFundingOptions) {
      const params = FundingOptionQuerySchema.parse(args);
      const fundingOptions = await fluentLab.fundingOption.getFundingOptions(params)

      if (fundingOptions.isOk()) {
        return {
          content: [
            { type: 'text', text: JSON.stringify(fundingOptions.value, null, 2), mimeType: "application/json" }
          ]
        }
      } else {
        return {
          content: [
            { type: 'text', text: "Failed to retrieve funding options" }
          ]
        }
      }
    }

    if (name === ToolName.GetDocumentChecklistForFundingProgramme) {
      const params = GetDocumentChecklistForFundingProgrammeSchema.parse(args);
      const checklist = await getDocumentChecklistForFundingProgramme(params);

      if (checklist.isErr()) {
        if (checklist.error.type === 'FUNDING_OPTION_NOT_FOUND') {
          return {
            content: [
              { type: 'text', text: `Funding option not found by slug ${params.slug}` }
            ]
          };
        }


        if (checklist.error.type === 'DOCUMENT_CHECKLIST_NOT_FOUND') {
          return {
            content: [
              { type: 'text', text: `Document checklist not found for funding option ${params.slug}` }
            ]
          };
        }

        if (checklist.error.type === 'API_UNAUTHORIZED_ERROR') {
          return {
            content: [
              { type: 'text', text: `Please pass the correct FLUENTLAB_API_KEY` }
            ]
          };
        }

        if (checklist.error.type === 'AXIOS_ERROR') {
          return {
            content: [
              { type: 'text', text: `Cannot reach FluentLab server, please retry again later.` }
            ]
          };
        }

        return {
          content: [
            { type: 'text', text: `Unknown error, please retry again later.` }
          ]
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(checklist.value, null, 2),
            mimeType: "application/json"
          },
        ],
      };
    }

    throw new Error(`Unknown tool: ${name}`);
  });

  const cleanup = async () => {

  };

  return { server, cleanup };
};