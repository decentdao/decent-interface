import { createAccountSubstring } from './../hooks/utils/useDisplayName';

export const createProposalNumberSubstring = (proposalNumber: string) => {
  if (proposalNumber.length < 8) {
    return proposalNumber;
  }
  return `#${createAccountSubstring(proposalNumber)}`;
};
