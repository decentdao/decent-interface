import { createAccountSubstring } from './../hooks/utils/useDisplayName';

export const createProposalNumberSubstring = (proposalId: string) => {
  if (proposalId.length < 10) {
    return `#${proposalId}`;
  }
  return `#${createAccountSubstring(proposalId)}`;
};
