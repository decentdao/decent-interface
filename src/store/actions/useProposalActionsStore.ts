import { create } from 'zustand';
import { ProposalActionsStore } from '../../types/proposalBuilder';
import { initialProposalActionsStore } from './proposalActionsStoreUtils';

export const useProposalActionsStore = create<ProposalActionsStore>()((set, get) => ({
  ...initialProposalActionsStore,
}));
