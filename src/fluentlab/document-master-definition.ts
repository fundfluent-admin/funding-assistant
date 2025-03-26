import { z } from "zod";
import { AxiosError, AxiosInstance } from "axios";
import { err, ok, ResultAsync } from "neverthrow";

import { TApiError } from "./types.js";

export const DocumentMasterDefinitionSchema = z.object({
  documentMasterDefinitionId: z.string().describe('Unique id of document master definition'),
  name: z.string().describe('Name of document type'),
  description: z.string().describe('Description of document type'),
});

export const DocumentMasterDefinitionQuerySchema = z.object({
  ids: z.array(z.string()),
})

export const DocumentMasterDefinitionPageSchema = z.object({
  definitions: z.array(DocumentMasterDefinitionSchema),
})

export type TDocumentMasterDefinition = z.infer<typeof DocumentMasterDefinitionSchema>;

export type TDocumentMasterDefinitionQuery = z.infer<typeof DocumentMasterDefinitionQuerySchema>;

export type TDocumentMasterDefinitionPage = z.infer<typeof DocumentMasterDefinitionPageSchema>;

export class DocumentMasterDefinition {
  constructor(private axiosInstance: AxiosInstance) {}

  async find(query: TDocumentMasterDefinitionQuery): Promise<ResultAsync<TDocumentMasterDefinitionPage, TApiError>> {
    try {
      const res = await this.axiosInstance.get('mcp/document-master-definitions', { params: query });
      return ok(res.data);
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        if (error.code === '401')
          return err({
            type: 'API_UNAUTHORIZED_ERROR',
            error,
          })
        return err({
          type: 'AXIOS_ERROR',
          error,
        })
      }
      return err({
        type: 'UNKNOWN_ERROR',
        error,
      })
    }
  }
}