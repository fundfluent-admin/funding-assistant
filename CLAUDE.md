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

### Project Structure
```
ff-mcp/
└── mcp-service/
    ├── src/
    │   ├── index.ts                 # Main entry point (stdio transport)
    │   ├── sse.ts                   # SSE transport server
    │   ├── funding-assistant.ts     # Core server implementation
    │   ├── fluentlab/              # API client modules
    │   │   ├── index.ts            # FluentLab client factory
    │   │   ├── funding-option.ts   # Funding options API
    │   │   ├── document-checklist.ts
    │   │   └── document-master-definition.ts
    │   ├── tools/                  # MCP tool implementations
    │   │   └── get-document-checklist-for-funding-programme.ts
    │   └── prompts/                # MCP prompt implementations
    │       ├── check-funding-documents.ts
    │       └── organize-funding-documents.ts
    ├── dist/                       # Compiled JavaScript
    ├── package.json
    └── tsconfig.json
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

### When Adding New Features

1. **New Tools**: 
   - Define clear input/output schemas using Zod
   - Implement proper error handling with neverthrow
   - Return structured JSON responses
   - Add comprehensive descriptions for AI understanding

2. **API Integration**:
   - Use the existing FluentLab client pattern
   - Handle all error cases (network, auth, not found)
   - Implement proper typing for API responses

3. **Error Handling**:
   - Use typed errors (see `TApiError` pattern)
   - Provide clear, actionable error messages
   - Distinguish between user errors and system errors

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

# Run SSE server
npm run start:sse
```

### Adding a New Tool
1. Create tool file in `src/tools/`
2. Define input/output schemas with Zod
3. Implement tool logic with proper error handling
4. Register in `funding-assistant.ts`
5. Test with MCP inspector

### Updating API Integration
1. Check API documentation for changes
2. Update types in `fluentlab/types.ts`
3. Modify client methods as needed
4. Test with real API calls

## Environment Variables
- `FLUENTLAB_API_KEY`: Required for API authentication
- `FLUENTLAB_MCP_API_URL`: Override default API URL
- `PORT`: SSE server port (default: 3500)

## Current Limitations & Improvements Needed

1. **SDK Version**: Update from 1.7.0 to 1.16.0 for new features
2. **Transport**: Migrate from SSE to Streamable HTTP
3. **Resources**: Add resource support for document access
4. **Auth**: Implement OAuth2 instead of simple API key
5. **Testing**: Add comprehensive test suite
6. **Caching**: Implement caching for frequently accessed data

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

## Getting Help

- Check `project-roadmap.md` for planned improvements
- Review TypeScript types for API contracts
- Use MCP inspector for debugging
- Test with real funding program data

Remember: This server is the critical bridge between AI capabilities and expert funding knowledge. Every improvement should make it easier for AI agents to help businesses secure funding successfully.
