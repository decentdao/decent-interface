import { create } from 'zustand';
import { ProposalActionsStore } from '../../types/proposalBuilder';
import { initialProposalActionsStore } from './proposalActionsStoreUtils';

export const useProposalActionsStore = create<ProposalActionsStore>()((set, get) => ({
  ...initialProposalActionsStore,
  addAction: action => set(state => ({ actions: [...state.actions, action] })),
  removeAction: actionIndex =>
    set(state => ({ actions: state.actions.filter((_, index) => index !== actionIndex) })),
  resetActions: () => set({ actions: [] }),
  getTransactions: () =>
    get()
      .actions.map(action => action.transactions)
      .flat(),
}));
