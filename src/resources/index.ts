import { ResourceRegistry } from "../types/mcp.js";
import { fundingDocumentsResource } from "./funding-documents.js";
import { fundingOptionsResource } from "./funding-options.js";
import { fundingTemplatesResource } from "./funding-templates.js";

// Export all resources as a registry
export const resourceRegistry: ResourceRegistry = {
  [fundingDocumentsResource.definition.name]: fundingDocumentsResource,
  [fundingOptionsResource.definition.name]: fundingOptionsResource,
  [fundingTemplatesResource.definition.name]: fundingTemplatesResource,
};

// Named exports for individual resources
export { fundingDocumentsResource, fundingOptionsResource, fundingTemplatesResource };