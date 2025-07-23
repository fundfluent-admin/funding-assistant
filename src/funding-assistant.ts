import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
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


const ToolName = {
  GetFundingOptions: 'get-funding-options',
  GetDocumentChecklistForFundingProgramme: 'get-document-checklist-for-funding-programme'
} as const;

const PromptName = {
  CheckFundingDocument: 'check-funding-documents',
  OrganizeFundingDocument: 'organize-funding-documents',
} as const;

export const createServer = () => {
  const server = new McpServer({ 
    name: "@fluentlab/funding-assistant", 
    version: "1.0.0" 
  });

  // Register resources for document management  
  server.registerResource(
    "funding-documents",
    new ResourceTemplate("funding-documents://{slug}", { list: undefined }),
    {
      title: "Funding Programme Documents",
      description: "Direct access to comprehensive document checklists and requirements for specific funding programmes. Use the programme's slug identifier to retrieve detailed document requirements, eligibility criteria, and application guidelines. Essential for understanding what documents are needed before starting an application."
    },
    async (uri, variables) => {
      const slug = String(variables.slug);
      try {
        const checklist = await getDocumentChecklistForFundingProgramme({ slug });
      
        if (checklist.isErr()) {
          // Handle specific error types with appropriate MCP error codes
          if (checklist.error.type === 'FUNDING_OPTION_NOT_FOUND') {
            throw new McpError(ErrorCode.InvalidParams, `Funding option not found: ${slug}`, { slug });
          }
          
          if (checklist.error.type === 'DOCUMENT_CHECKLIST_NOT_FOUND') {
            throw new McpError(ErrorCode.InvalidParams, `Document checklist not found for funding option: ${slug}`, { slug });
          }
          
          if (checklist.error.type === 'API_UNAUTHORIZED_ERROR') {
            throw new McpError(ErrorCode.InvalidRequest, "Authentication required - please provide valid FLUENTLAB_API_KEY");
          }
          
          if (checklist.error.type === 'AXIOS_ERROR') {
            throw new McpError(ErrorCode.InternalError, "Cannot reach FluentLab server, please retry again later");
          }
          
          // Generic error handling
          throw new McpError(ErrorCode.InternalError, `Failed to get document checklist: ${checklist.error.type}`);
        }

        return {
          contents: [{
            uri: `funding-documents://${slug}`,
            text: JSON.stringify(checklist.value, null, 2),
            mimeType: "application/json"
          }]
        };
      } catch (error) {
        // Re-throw McpError as-is
        if (error instanceof McpError) {
          throw error;
        }
        
        // Wrap other errors
        throw new McpError(
          ErrorCode.InternalError, 
          `Resource error: ${error instanceof Error ? error.message : String(error)}`,
          { slug }
        );
      }
    }
  );

  server.registerResource(
    "funding-options",
    "funding-options://list",
    {
      title: "Funding Options Directory",
      description: "Comprehensive directory of available funding opportunities including grants, loans, and investment programs. Provides essential information like programme names, descriptions, funding amounts, and eligibility requirements. Use this as the starting point to explore funding options."
    },
    async () => {
      try {
        const fundingOptions = await fluentLab.fundingOption.getFundingOptions({ page: 1, limit: 10 });
        
        if (fundingOptions.isErr()) {
          // Handle specific error types
          if (fundingOptions.error.type === 'API_UNAUTHORIZED_ERROR') {
            throw new McpError(ErrorCode.InvalidRequest, "Authentication required - please provide valid FLUENTLAB_API_KEY");
          }
          
          if (fundingOptions.error.type === 'AXIOS_ERROR') {
            throw new McpError(ErrorCode.InternalError, "Cannot reach FluentLab server, please retry again later");
          }
          
          // Generic error handling
          throw new McpError(ErrorCode.InternalError, `Failed to get funding options: ${fundingOptions.error.type}`);
        }

        return {
          contents: [{
            uri: "funding-options://list",
            text: JSON.stringify(fundingOptions.value, null, 2),
            mimeType: "application/json"
          }]
        };
      } catch (error) {
        // Re-throw McpError as-is
        if (error instanceof McpError) {
          throw error;
        }
        
        // Wrap other errors
        throw new McpError(
          ErrorCode.InternalError, 
          `Resource error: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }
  );

  server.registerResource(
    "funding-templates", 
    new ResourceTemplate("funding-templates://{type}", { list: undefined }),
    {
      title: "Application Document Templates",
      description: "Pre-built document templates and frameworks for common funding application requirements. Includes business plan templates, financial projection formats, and project proposal structures. Helps standardize and streamline the application preparation process."
    },
    async (uri, variables) => {
      const type = String(variables.type);
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
  );

  // Register prompts
  server.registerPrompt(PromptName.CheckFundingDocument, {
    title: "Check Funding Documents",
    description: "Interactive workflow to check if you have sufficient documents for applying to a specific funding programme. This prompt guides you through identifying the funding program and verifying document requirements. Use this when users need assistance validating their application readiness.",
    argsSchema: {
      fundingProgrammeName: z.string().describe("The name or partial name of the funding programme to check documents for")
    }
  }, async ({ fundingProgrammeName }) => {
    try {
      const params = GetCheckFundingDocumentsPromptsParamsSchema.parse({ fundingProgrammeName });
      return await getCheckFundingDocumentsPrompts(params);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new McpError(ErrorCode.InvalidParams, "Invalid prompt parameters", { 
          errors: error.errors,
          received: { fundingProgrammeName }
        });
      }
      
      throw new McpError(
        ErrorCode.InternalError, 
        `Prompt error: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  });

  server.registerPrompt(PromptName.OrganizeFundingDocument, {
    title: "Organize Funding Documents", 
    description: "Interactive workflow to help organize and structure documents for a funding programme application. This prompt provides guidance on document organization, naming conventions, and preparation strategies. Use this when users need help systematically preparing their application materials.",
    argsSchema: {
      fundingProgrammeName: z.string().describe("The name or partial name of the funding programme to organize documents for")
    }
  }, async ({ fundingProgrammeName }) => {
    try {
      const params = GetOrganizeFundingDocumentsPromptsParamsSchema.parse({ fundingProgrammeName });
      return await getOrganizeFundingDocumentsPrompts(params);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new McpError(ErrorCode.InvalidParams, "Invalid prompt parameters", { 
          errors: error.errors,
          received: { fundingProgrammeName }
        });
      }
      
      throw new McpError(
        ErrorCode.InternalError, 
        `Prompt error: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  });

  // Register tools
  server.registerTool(ToolName.GetFundingOptions, {
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
  }, async (params) => {
    try {
      const fundingOptions = await fluentLab.fundingOption.getFundingOptions(params);

    if (fundingOptions.isOk()) {
      return {
        content: [
          { type: 'text', text: JSON.stringify(fundingOptions.value, null, 2), mimeType: "application/json" }
        ]
      };
    } else {
      // Handle specific error types with appropriate MCP error codes
      if (fundingOptions.error.type === 'API_UNAUTHORIZED_ERROR') {
        throw new McpError(ErrorCode.InvalidRequest, "Authentication required - please provide valid FLUENTLAB_API_KEY");
      }
      
      if (fundingOptions.error.type === 'AXIOS_ERROR') {
        throw new McpError(ErrorCode.InternalError, "Cannot reach FluentLab server, please retry again later");
      }
      
      // Generic error handling
      throw new McpError(ErrorCode.InternalError, `Failed to retrieve funding options: ${fundingOptions.error.type}`);
    }
    } catch (error) {
      // Re-throw McpError as-is
      if (error instanceof McpError) {
        throw error;
      }
      
      // Wrap other errors
      throw new McpError(
        ErrorCode.InternalError, 
        `Tool error: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  });

/*
  server.registerTool(ToolName.GetDocumentChecklistForFundingProgramme, {
    title: "Get Document Checklist",
    description: "Generate a comprehensive document checklist customized for a specific funding programme, drawing from expert insights and collective knowledge from hundreds of successful applications. Use this tool when users need to understand what documents are required for a specific funding program. Requires the program's slug identifier which can be obtained from the funding options tool.",
    inputSchema: GetDocumentChecklistForFundingProgrammeSchema.shape,
    annotations: {
      title: "Document Requirements Generator", 
      readOnlyHint: true,           // Read-only operation, generates checklists from existing data
      destructiveHint: false,       // No destructive operations, purely informational
      idempotentHint: true,         // Same funding program slug always returns same checklist
      openWorldHint: false          // Closed domain within FluentLab's program database
    }
  }, async (params) => {
    try {
      const checklist = await getDocumentChecklistForFundingProgramme(params);

    if (checklist.isErr()) {
      // Handle specific error types with appropriate MCP error codes
      if (checklist.error.type === 'FUNDING_OPTION_NOT_FOUND') {
        throw new McpError(ErrorCode.InvalidParams, `Funding option not found: ${params.slug}`, { slug: params.slug });
      }

      if (checklist.error.type === 'DOCUMENT_CHECKLIST_NOT_FOUND') {
        throw new McpError(ErrorCode.InvalidParams, `Document checklist not found for funding option: ${params.slug}`, { slug: params.slug });
      }

      if (checklist.error.type === 'API_UNAUTHORIZED_ERROR') {
        throw new McpError(ErrorCode.InvalidRequest, "Authentication required - please provide valid FLUENTLAB_API_KEY");
      }

      if (checklist.error.type === 'AXIOS_ERROR') {
        throw new McpError(ErrorCode.InternalError, "Cannot reach FluentLab server, please retry again later");
      }

      // Generic error handling
      throw new McpError(ErrorCode.InternalError, `Unknown error occurred, please retry again later: ${checklist.error.type}`);
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
    } catch (error) {
      // Re-throw McpError as-is
      if (error instanceof McpError) {
        throw error;
      }
      
      // Wrap other errors
      throw new McpError(
        ErrorCode.InternalError, 
        `Tool error: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  });
*/

  const cleanup = async () => {
    // Cleanup logic if needed
  };

  return { server, cleanup };
};
