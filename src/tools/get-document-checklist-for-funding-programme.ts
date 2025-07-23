import { z } from "zod";
import { err, ok, ResultAsync } from "neverthrow";
import { fluentLab } from "../fluentlab/index.js";
import { DocumentChecklistSchema, DocumentRequirement } from "../fluentlab/document-checklist.js";
import { TApiError } from "../fluentlab/types.js";

export const GetDocumentChecklistForFundingProgrammeSchema = z.object({
  slug: z.string().describe("FluentLab defined slug of a funding programme"),
});

export const DocumentChecklistItemForFundingProgrammeSchema = z.object({
  documentMasterDefinitionId: z.string().describe('Unique id of a document type'),
  documentTypeName: z.string().describe('Descriptive name of this document type'),
  documentTypeDescription: z.string().describe('Descriptions this document type'),
  requirements: z.array(DocumentRequirement),
});

export const DocumentChecklistForFundingProgrammeSchema = DocumentChecklistSchema.omit({ items: true }).extend({
  items: z.array(DocumentChecklistItemForFundingProgrammeSchema),
});

export type TGetDocumentChecklistForFundingProgramme = z.infer<typeof GetDocumentChecklistForFundingProgrammeSchema>;

export type TDocumentChecklistForFundingProgramme = z.infer<typeof DocumentChecklistForFundingProgrammeSchema>;

export type TGetDocumentChecklistError =
  | TApiError
  | { type: 'FUNDING_OPTION_NOT_FOUND' }
  | { type: 'DOCUMENT_CHECKLIST_NOT_FOUND' };

export async function getDocumentChecklistForFundingProgramme(
  dto: TGetDocumentChecklistForFundingProgramme,
): Promise<ResultAsync<TDocumentChecklistForFundingProgramme, TGetDocumentChecklistError>> {
  const fundingOption = await fluentLab.fundingOption.findBySlug(dto.slug);

  if (fundingOption.isErr() || !fundingOption.value)
    return err({
      type: 'FUNDING_OPTION_NOT_FOUND'
    });

  const checklistPage = await fluentLab.documentCheckList.find({
    originType: 'FundingOption',
    originRefId: fundingOption.value.id,
  })

  if (checklistPage.isErr() || !checklistPage.value || !checklistPage.value.checklists.length)
    return err({
      type: 'DOCUMENT_CHECKLIST_NOT_FOUND'
    });

  const checklist = checklistPage.value.checklists.at(0);

  if (!checklist)
    return err({
      type: 'DOCUMENT_CHECKLIST_NOT_FOUND'
    });

  const definitionPage = await fluentLab.documentMasterDefinition.find({
    ids: checklist.items.map(item => item.documentMasterDefinitionId),
  })

  const definitions = definitionPage.isErr() ? [] : definitionPage.value.definitions;
  const definitionMap = new Map(definitions.map(def => [def.documentMasterDefinitionId, def]));

  const result: TDocumentChecklistForFundingProgramme = {
    ...checklist,
    items: checklist.items.map(item => ({
      ...item,
      documentTypeName: definitionMap.get(item.documentMasterDefinitionId)?.name ?? '',
      documentTypeDescription: definitionMap.get(item.documentMasterDefinitionId)?.description ?? '',
    }))
  }

  return ok(result);

  // return {
  //   documentChecklist: [
  //     {
  //       name: "EMF application form",
  //       description: "the official EMF application form",
  //     },
  //     {
  //       name: "Business Registration",
  //       description: "Business registration certificate (BR) is a legal document required for any person or company operating a business in Hong Kong",
  //     },
  //     {
  //       name: "Certificate of Incorporation",
  //       description: "The Certificate of Incorporation serves to affirm the legal establishment and registration of a company, validating its existence and compliance with Hong Kong’s legal requirements",
  //       requirements: [
  //         "only required for limited company"
  //       ]
  //     },
  //     {
  //       name: "Bank Statement",
  //       description: "Copy of business bank account statement"
  //     }
  //   ]
  // };
}
