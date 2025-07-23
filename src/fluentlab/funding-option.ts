import { z } from "zod";
import { AxiosError, AxiosInstance } from "axios";
import { err, ok, ResultAsync } from "neverthrow";
import { PageSchema, TApiError } from "./types.js";

export const FunderSchema = z.object({
  name: z.string().describe("Name of the funder"),
  slug: z.string().describe("Slug of the funder"),
});

export const FundingOptionSchema = z.object({
  id: z.string().describe("Unique funding option id by FluentLab"),
  fundingOpportunityName: z.string().describe("Name of funding programme"),
  shortName: z.string().describe("Short name or abbreviation of funding programme"),
  programDescription: z.string().describe("Detailed description of funding programme"),
  programSummary: z.string().describe("Brief summary of funding programme"),
  shortProgramSummary: z.string().describe("Very brief summary of funding programme"),
  originalSlug: z.string().describe("Slug of funding programme"),
  status: z.string().describe("Current status of the funding programme"),
  fundingSize: z.string().describe("Funding amount range (e.g., 'up to HKD 100,000')"),
  maximumFundingAmount: z.number().describe("Maximum funding amount as number"),
  maximumFundingAmountCurrencyCode: z.string().describe("Currency code for funding amount"),
  opportunityType: z.string().describe("Type of funding opportunity (e.g., 'Cash Grant')"),
  originationJurisdiction: z.string().describe("Jurisdiction where funding originates"),
  sourceCategory: z.string().describe("Category of funding source"),
  targetAudience: z.array(z.string()).describe("Target audience for the funding"),
  difficultyLevel: z.string().describe("Application difficulty level"),
  disbursementTerms: z.array(z.string()).describe("Terms for fund disbursement"),
  nextDeadline: z.string().nullable().describe("Next application deadline"),
  predictedDeadline: z.string().nullable().describe("Predicted deadline if not confirmed"),
  applicationFormURL: z.string().describe("URL to application form"),
  officialWebsiteURL: z.string().describe("Official website URL"),
  guidelineURL: z.string().describe("URL to application guidelines"),
  contactEmail: z.string().describe("Contact email for inquiries"),
  contactPhone: z.string().describe("Contact phone number"),
  trending: z.boolean().nullable().describe("Whether this opportunity is trending"),
  createdAt: z.string().describe("ISO date when record was created"),
  updatedAt: z.string().describe("ISO date when record was last updated"),
  discoveryDate: z.string().describe("ISO date when opportunity was discovered"),
});

export const FundingOptionQuerySchema = z.object({
  limit: z.number().int().positive().min(1).max(100).default(10),
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

