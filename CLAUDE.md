# CLAUDE.md - FundFluent MCP Server Development Guide

## Project Overview

This is the FundFluent MCP (Model Context Protocol) server, designed to provide funding program information and assistance to AI agents performing funding-related tasks. The server acts as a bridge between AI systems and FundFluent's enriched funding database.

## Core Purpose

The MCP server enables AI agents to:
- Search and retrieve funding opportunities
- Access document checklists for specific funding programs
- Get detailed requirements for funding applications
- Organize and validate funding documents
- Provide expert insights based on hundreds of successful applications

## Technical Context

### Current Stack
- **Language**: TypeScript (ES2022)
- **Runtime**: Node.js 16+
- **SDK**: @modelcontextprotocol/sdk v1.7.0 (needs update to v1.16.0)
- **Key Dependencies**:
  - axios: HTTP client for API calls
  - express: For SSE transport server
  - zod: Schema validation
  - neverthrow: Error handling
  - nodemon: Development server

### Architecture
```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   AI Agents     │────▶│   MCP Server     │────▶│  FluentLab API  │
│ (Claude, etc.)  │◀────│                  │◀────│   (Enriched DB) │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

### Project Structure (Modular Architecture - July 2025)
```
ff-mcp/
└── mcp-service/
    ├── src/
    │   ├── index.ts                 # Main entry point (stdio transport)
    │   ├── http-server.ts           # HTTP transport server  
    │   ├── funding-assistant.ts     # Core server (18 lines - modular!)
    │   │
    │   ├── types/
    │   │   └── mcp.ts              # Type definitions for modular components
    │   │
    │   ├── utils/
    │   │   └── error-handler.ts    # Centralized error handling middleware
    │   │
    │   ├── registries/             # Registration system
    │   │   ├── registry-utils.ts   # Registration utilities  
    │   │   └── index.ts           # Master registration orchestrator
    │   │
    │   ├── tools/                  # Modular tool implementations
    │   │   ├── get-funding-options.ts
    │   │   ├── get-document-checklist-for-funding-programme.ts
    │   │   └── index.ts           # Tool registry
    │   │
    │   ├── resources/              # Modular resource handlers
    │   │   ├── funding-documents.ts
    │   │   ├── funding-options.ts
    │   │   ├── funding-templates.ts  
    │   │   └── index.ts           # Resource registry
    │   │
    │   ├── prompts-registry/       # Modular prompt handlers
    │   │   ├── check-funding-documents.ts
    │   │   ├── organize-funding-documents.ts
    │   │   └── index.ts           # Prompt registry
    │   │
    │   ├── prompts/                # Original prompt implementations (legacy)
    │   │   ├── check-funding-documents.ts
    │   │   └── organize-funding-documents.ts
    │   │
    │   └── fluentlab/              # API client modules  
    │       ├── index.ts            # FluentLab client factory
    │       ├── funding-option.ts   # Funding options API
    │       ├── document-checklist.ts
    │       ├── document-master-definition.ts
    │       └── types.ts            # API type definitions
    │
    ├── dist/                       # Compiled JavaScript
    ├── package.json
    ├── tsconfig.json
    └── project-roadmap.md          # Development roadmap and status
```

## Available Capabilities

### Tools
1. **get-funding-options**
   - Search and filter funding opportunities
   - Returns detailed funding program information
   - Supports filtering by various criteria

2. **get-document-checklist-for-funding-programme**
   - Retrieves comprehensive document requirements
   - Provides expert insights from successful applications
   - Returns structured checklist with descriptions and requirements

### Prompts
1. **check-funding-documents**
   - Validates if sufficient documents exist for a funding application
   - Identifies missing or incomplete documents

2. **organize-funding-documents**
   - Helps structure documents according to program requirements
   - Provides organization recommendations

## API Integration

The server connects to FluentLab's API:
- **Base URL**: `https://api.fundfluent.io/exp/sme-exp`
- **Authentication**: API key via `FLUENTLAB_API_KEY` environment variable
- **Key Endpoints**:
  - Funding options search
  - Document checklists
  - Document master definitions

## Domain Knowledge

### Funding Programs
- Each program has a unique `slug` identifier
- Programs contain eligibility criteria, deadlines, and requirements
- Document requirements vary by program and company type

### Document Types
- **Business Registration (BR)**: Required for all Hong Kong businesses
- **Certificate of Incorporation**: Required for limited companies
- **Bank Statements**: Proof of business operations
- **Application Forms**: Program-specific forms
- Each document type has master definitions with detailed requirements

### Hong Kong Context
- Primary focus on Hong Kong funding programs (EMF, BUD, TVP, etc.)
- Compliance with Hong Kong business regulations
- Understanding of local business structures and requirements

## Development Guidelines

### Modular Architecture (New - July 2025)

The codebase has been restructured with a modular registry pattern for maximum scalability and maintainability:

1. **Core Benefits**:
   - Main server file reduced from 378 lines to 18 lines (95% reduction)
   - Each tool/resource/prompt is in its own testable module
   - Centralized error handling eliminates code duplication
   - Easy to add new components without touching main server code

2. **Component Structure**:
   ```typescript
   // Each tool follows this pattern:
   export const myTool: McpTool = {
     definition: {
       name: 'my-tool',
       title: 'My Tool',
       description: '...',
       inputSchema: MySchema.shape,
       annotations: { ... }
     },
     handler: async (params) => {
       // Clean business logic only
       // Error handling is automatic via middleware
     }
   };
   ```

### When Adding New Features

1. **New Tools** (Modular Pattern):
   - Create file in `src/tools/my-new-tool.ts`
   - Export tool following `McpTool` interface pattern
   - Add to tool registry in `src/tools/index.ts`
   - Error handling is automatic via centralized middleware
   - Define clear input/output schemas using Zod
   - Return structured JSON responses

2. **New Resources** (Modular Pattern):
   - Create file in `src/resources/my-new-resource.ts`
   - Export resource following `McpResource` interface pattern
   - Add to resource registry in `src/resources/index.ts`
   - Support both static URIs and ResourceTemplate patterns

3. **New Prompts** (Modular Pattern):
   - Create file in `src/prompts-registry/my-new-prompt.ts`
   - Export prompt following `McpPrompt` interface pattern
   - Add to prompt registry in `src/prompts-registry/index.ts`

4. **API Integration**:
   - Use the existing FluentLab client pattern
   - Handle all error cases (network, auth, not found)
   - Implement proper typing for API responses
   - Error handling is centralized in `src/utils/error-handler.ts`

5. **Error Handling** (Centralized):
   - All error handling is now centralized in `src/utils/error-handler.ts`
   - Supports `TApiError`, `FUNDING_OPTION_NOT_FOUND`, `DOCUMENT_CHECKLIST_NOT_FOUND`
   - Automatic conversion to appropriate MCP error codes
   - No need to implement error handling in individual tools/resources

### Code Style
- Use ES modules (`.js` extensions in imports)
- Async/await over promises
- Functional programming with neverthrow for errors
- Clear, descriptive variable names
- Document complex business logic

### Testing Approach
- Use the MCP inspector for interactive testing: `npm run inspector`
- Test with real funding program slugs
- Validate error scenarios
- Check response schemas match expectations

## Common Tasks

### Running the Server
```bash
# Development with auto-reload
npm run start:watch

# Run MCP inspector for testing
npm run inspector

# Build for production
npm run build

# Run HTTP server  
npm run start:http
```

### Adding a New Tool (Modular Pattern)
1. Create tool file in `src/tools/my-new-tool.ts`:
   ```typescript
   import { McpTool } from "../types/mcp.js";
   import { z } from "zod";
   
   const MyToolSchema = z.object({
     param1: z.string(),
     param2: z.number().optional()
   });
   
   export const myNewTool: McpTool = {
     definition: {
       name: 'my-new-tool',
       title: 'My New Tool',
       description: 'Description of what this tool does',
       inputSchema: MyToolSchema.shape,
       annotations: {
         readOnlyHint: true,
         destructiveHint: false,
         idempotentHint: true,
         openWorldHint: false
       }
     },
     handler: async (params) => {
       // Clean business logic - error handling is automatic
       const result = await someApiCall(params);
       return {
         content: [{ 
           type: 'text', 
           text: JSON.stringify(result, null, 2),
           mimeType: "application/json" 
         }]
       };
     }
   };
   ```

2. Add to tool registry in `src/tools/index.ts`:
   ```typescript
   import { myNewTool } from "./my-new-tool.js";
   
   export const toolRegistry: ToolRegistry = {
     ...existingTools,
     [myNewTool.definition.name]: myNewTool,
   };
   ```

3. Test with MCP inspector: `npm run inspector`

### Adding a New Resource (Modular Pattern)
1. Create resource file in `src/resources/my-new-resource.ts`
2. Follow `McpResource` interface pattern
3. Add to resource registry in `src/resources/index.ts`
4. Test with MCP inspector

### Updating API Integration
1. Check API documentation for changes
2. Update types in `fluentlab/types.ts`
3. Modify client methods as needed
4. Test with real API calls

## Environment Variables
- `FLUENTLAB_API_KEY`: Required for API authentication (Bearer token)
- `FLUENTLAB_MCP_API_URL`: Override default API URL (default: https://api.fundfluent.io/exp/sme-exp)
- `PORT`: HTTP server port (default: 4002)
- `MCP_ALLOWED_HOSTS`: Comma-separated allowed hosts (default: 127.0.0.1,localhost)
- `MCP_ALLOWED_ORIGINS`: Comma-separated allowed origins (default: *)
- `MCP_ENABLE_SESSIONS`: Enable session management (default: true)
- `MCP_ENABLE_DNS_REBINDING`: Enable DNS rebinding protection (default: true)

## Architecture Status (July 2025) ✅

**All Major Improvements Completed:**
1. ✅ **SDK Version**: Updated to 1.16.0 with latest features
2. ✅ **Transport**: StreamableHTTP transport implemented  
3. ✅ **Resources**: Full resource support for document access
4. ✅ **Auth**: Functional API key authentication with Bearer token
5. ✅ **Modular Architecture**: Registry pattern with 95% line reduction
6. ✅ **Error Handling**: Centralized error handling with MCP codes
7. ✅ **Tool Annotations**: Enhanced annotations for better LLM understanding

**Remaining Future Enhancements** (Data-driven decisions):
- OAuth2 migration (evaluate after 3-6 months of usage)
- Comprehensive testing suite (based on usage patterns)
- Caching layer (when performance needs arise)

## Future Enhancements

1. **Document Processing**:
   - OCR capabilities for document validation
   - Template matching for document types
   - Automated form filling assistance

2. **Intelligent Features**:
   - Eligibility pre-screening
   - Success probability estimation
   - Application timeline management
   - Funding amount optimization

3. **Multi-language Support**:
   - Support for Traditional Chinese (primary)
   - Bilingual document handling

## Quick Reference

### Common Funding Program Slugs
- `emf-fund` - EMF Enterprise Support Scheme
- `bud-fund` - BUD Fund
- `tvp-scheme` - Technology Voucher Programme
- `reindustrialisation-funding`
- `recycling-fund`

### Error Types
- `FUNDING_OPTION_NOT_FOUND`: Invalid program slug
- `DOCUMENT_CHECKLIST_NOT_FOUND`: No checklist for program
- `API_UNAUTHORIZED_ERROR`: Invalid API key
- `AXIOS_ERROR`: Network or server error

## Development Philosophy

1. **AI-First Design**: Every feature should enhance AI agent capabilities
2. **Expert Knowledge**: Leverage insights from successful applications
3. **Clear Communication**: Provide detailed, actionable information
4. **Reliability**: Handle errors gracefully, always return useful responses
5. **Extensibility**: Design for future funding programs and requirements
6. **Modular Architecture**: Keep components separate, testable, and maintainable
7. **DRY Principles**: Centralize common patterns like error handling

## Key Files to Understand

### Core Architecture
- `src/funding-assistant.ts` - Main server (18 lines, just orchestration)
- `src/registries/index.ts` - Master registration system
- `src/types/mcp.ts` - Type definitions for modular components
- `src/utils/error-handler.ts` - Centralized error handling

### Adding Components
- `src/tools/index.ts` - Tool registry (add new tools here)
- `src/resources/index.ts` - Resource registry (add new resources here)  
- `src/prompts-registry/index.ts` - Prompt registry (add new prompts here)

### Examples
- `src/tools/get-funding-options.ts` - Example modular tool
- `src/resources/funding-documents.ts` - Example modular resource
- `src/prompts-registry/check-funding-documents.ts` - Example modular prompt

## Getting Help

- Check `project-roadmap.md` for planned improvements and completed phases
- Review TypeScript types in `src/types/mcp.ts` for component interfaces
- Use MCP inspector for debugging: `npm run inspector`
- Test with real funding program data
- Look at existing tools/resources as examples when creating new ones

## Migration Notes (July 2025)

If you encounter old code patterns or references:
- The old monolithic `funding-assistant.ts` (378 lines) has been replaced with modular architecture
- All error handling is now centralized - don't implement it in individual components
- Tools, resources, and prompts are now in separate registries
- The `src/prompts/` directory contains legacy implementations (still used by modular prompts)

Remember: This server is the critical bridge between AI capabilities and expert funding knowledge. The modular architecture makes it infinitely scalable while maintaining simplicity for developers.
