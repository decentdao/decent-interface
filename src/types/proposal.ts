import { ExecuteData } from './execute';

export interface ProposalExecuteData extends ExecuteData {
  title: string;
  description: string;
  documentationUrl: string;
}
