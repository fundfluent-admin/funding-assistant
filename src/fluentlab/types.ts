import { AxiosError } from "axios";
import { z } from "zod";

export const PageSchema = z.object({
  page: z.number().int().describe('Current page'),
  totalRecords: z.number().int().describe('Number of total records'),
  totalPages: z.number().int().describe('Number of total pages'),
});

export type TApiError =
  | { type: 'AXIOS_ERROR'; error: AxiosError }
  | { type: 'API_UNAUTHORIZED_ERROR'; error: AxiosError }
  | { type: 'UNKNOWN_ERROR'; error: any };