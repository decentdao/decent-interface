import { createAccountSubstring } from './../hooks/utils/useDisplayName';

export const createProposalNumberSubstring = (proposalNumber: string) => {
  if (proposalNumber.length < 10) {
    return `#${proposalNumber}`;
  }
  return `#${createAccountSubstring(proposalNumber)}`;
};
