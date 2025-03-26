import { z } from "zod";
import { AxiosError, AxiosInstance } from "axios";
import { err, ok, ResultAsync } from "neverthrow";
import { PageSchema, TApiError } from "./types.js";

export const DocumentRequirement = z.object({
  content: z.string().describe('Description of a specific requirements of this document')
});

export const DocumentChecklistItemSchema = z.object({
  documentMasterDefinitionId: z.string().describe('Unique id of a document type'),
  requirements: z.array(DocumentRequirement),
});

export const DocumentChecklistSchema = z.object({
  documentChecklistId: z.string().describe('Unique id of document checklist'),
  name: z.string().describe('Name of document checklist'),
  items: z.array(DocumentChecklistItemSchema).describe('List of documents in the checklist'),
});

export const DocumentChecklistQuerySchema = z.object({
  originType: z.string(),
  originRefId: z.string(),
});

export const DocumentChecklistPageSchema = PageSchema.extend({
  checklists: z.array(DocumentChecklistSchema),
});

export type TDocumentChecklist = z.infer<typeof DocumentChecklistSchema>;

export type TDocumentChecklistQuery = z.infer<typeof DocumentChecklistQuerySchema>;

export type TDocumentChecklistPage = z.infer<typeof DocumentChecklistPageSchema>;

export class DocumentChecklist {
  constructor(private axiosInstance: AxiosInstance) {}

  async find(query: TDocumentChecklistQuery): Promise<ResultAsync<TDocumentChecklistPage, TApiError>> {
    try {
      const res = await this.axiosInstance.get('mcp/document-checklists', { params: query });
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