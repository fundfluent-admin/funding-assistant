import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { TApiError } from "../fluentlab/types.js";

// Extended error type that includes specific MCP errors
type ExtendedApiError = TApiError | 
  { type: 'FUNDING_OPTION_NOT_FOUND' } | 
  { type: 'DOCUMENT_CHECKLIST_NOT_FOUND' };

/**
 * Centralized error handling for MCP operations
 * Converts various error types to appropriate MCP errors
 */
export const handleMcpError = (error: unknown, context?: Record<string, any>): never => {
  // Re-throw McpError as-is
  if (error instanceof McpError) {
    throw error;
  }

  // Handle Zod validation errors
  if (error instanceof z.ZodError) {
    throw new McpError(ErrorCode.InvalidParams, "Invalid parameters", {
      errors: error.errors,
      context
    });
  }

  // Handle API errors from FluentLab
  if (error && typeof error === 'object' && 'type' in error) {
    const apiError = error as ExtendedApiError;
    
    switch (apiError.type) {
      case 'API_UNAUTHORIZED_ERROR':
        throw new McpError(
          ErrorCode.InvalidRequest, 
          "Authentication required - please provide valid FLUENTLAB_API_KEY"
        );
        
      case 'AXIOS_ERROR':
        throw new McpError(
          ErrorCode.InternalError, 
          "Cannot reach FluentLab server, please retry again later"
        );
        
      case 'FUNDING_OPTION_NOT_FOUND':
        throw new McpError(
          ErrorCode.InvalidParams, 
          `Funding option not found`,
          context
        );
        
      case 'DOCUMENT_CHECKLIST_NOT_FOUND':
        throw new McpError(
          ErrorCode.InvalidParams, 
          `Document checklist not found`,
          context
        );
        
      case 'UNKNOWN_ERROR':
        throw new McpError(
          ErrorCode.InternalError,
          `Unknown error occurred`,
          context
        );
    }
  }

  // Generic error handling
  throw new McpError(
    ErrorCode.InternalError,
    `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
    context
  );
};

/**
 * Higher-order function to wrap handlers with error handling
 */
export const withErrorHandling = <TInput, TOutput>(
  handler: (params: TInput) => Promise<TOutput>,
  context?: Record<string, any>
) => {
  return async (params: TInput): Promise<TOutput> => {
    try {
      return await handler(params);
    } catch (error) {
      return handleMcpError(error, { ...context, params });
    }
  };
};

/**
 * Wrapper for resource handlers with error handling
 */
export const withResourceErrorHandling = <TVariables = Record<string, any>>(
  handler: (uri: string | URL, variables?: TVariables) => Promise<any>,
  resourceName?: string
) => {
  return async (uri: string | URL, variables?: TVariables) => {
    try {
      const uriString = typeof uri === 'string' ? uri : uri.toString();
      return await handler(uriString, variables);
    } catch (error) {
      return handleMcpError(error, { resourceName, uri: uri.toString(), variables });
    }
  };
};

/**
 * Wrapper for prompt handlers with error handling
 */
export const withPromptErrorHandling = <TArgs>(
  handler: (args: TArgs) => Promise<any>,
  promptName?: string
) => {
  return async (args: TArgs) => {
    try {
      return await handler(args);
    } catch (error) {
      return handleMcpError(error, { promptName, args });
    }
  };
};