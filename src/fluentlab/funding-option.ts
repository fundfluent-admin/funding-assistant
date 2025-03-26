import { z } from "zod";
import { AxiosError, AxiosInstance } from "axios";
import { err, ok, ResultAsync } from "neverthrow";
import { PageSchema, TApiError } from "./types.js";

export const FunderSchema = z.object({
  name: z.string().describe("Name of the funder"),
  slug: z.string().describe("Slug of the funder"),
});

export const FundingOptionSchema = z.object({
  fundingOptionId: z.string().describe("Unique funding option id by FluentLab"),
  name: z.string().describe("Name of funding programme"),
  shortName: z.string().describe("Short name or abbreviation of funding programme"),
  description: z.string().describe("Short name or abbreviation of funding programme"),
  slug: z.string().describe("Slug of funding programme"),
  funder: FunderSchema,
  links: z.record(z.string(), z.string()).describe('Relevant urls of useful resources about this funding programme'),
});

export const FundingOptionQuerySchema = z.object({
  limit: z.number().int().positive().min(1).max(100),
  page: z.number().int().positive().min(1),
});

export const FundingOptionPageSchema = PageSchema.extend({
  fundingOptions: z.array(FundingOptionSchema),
});

export type TFunder = z.infer<typeof FunderSchema>;

export type TFundingOption = z.infer<typeof FundingOptionSchema>;

export type TFundingOptionQuery = z.infer<typeof FundingOptionQuerySchema>;

export type TFundingOptionPage = z.infer<typeof FundingOptionPageSchema>;

export class FundingOption {
  constructor(private axiosInstance: AxiosInstance) {}

  async getFundingOptions(query: TFundingOptionQuery): Promise<ResultAsync<TFundingOptionPage, TApiError>> {
    try {
      const res = await this.axiosInstance.get('mcp/funding-options', { params: query });
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

  async findBySlug(slug: string): Promise<ResultAsync<TFundingOption, TApiError>> {
    try {
      const res = await this.axiosInstance.get(`mcp/funding-options/slug/${slug}`);
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

