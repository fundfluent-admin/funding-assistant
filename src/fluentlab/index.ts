import axios, { AxiosInstance } from 'axios';
import { FundingOption } from "./funding-option.js";
import { DocumentChecklist } from "./document-checklist.js";
import { DocumentMasterDefinition } from "./document-master-definition.js";

export class FluentLab {
  axiosInstance: AxiosInstance = axios.create({
    baseURL: process.env.FLUENTLAB_MCP_API_URL || 'https://api.fundfluent.io/exp/sme-exp',
    headers: {
      'Authorization': `Bearer ${process.env.FLUENTLAB_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });
  fundingOption: FundingOption = new FundingOption(this.axiosInstance);
  documentCheckList: DocumentChecklist = new DocumentChecklist(this.axiosInstance);
  documentMasterDefinition: DocumentMasterDefinition = new DocumentMasterDefinition(this.axiosInstance);
}

export const fluentLab = new FluentLab();