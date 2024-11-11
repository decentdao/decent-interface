const deleteProposalCache = (proposalKeys: string[]) => {
  proposalKeys.forEach(key => {
    localStorage.removeItem(key);
  });
};

//@dev for testing seperated the function from the hook and export
export default function migration2() {
  const allV0ProposalKeys = Object.keys(localStorage).filter(key =>
    key.startsWith('{"cacheName":"Proposal"'),
  );
  deleteProposalCache(allV0ProposalKeys);
}
