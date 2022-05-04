function ProposalDescription({ proposalDesc }: { proposalDesc: string }) {

  return (
    <div className="py-4 text-white text-lg font-mono">{proposalDesc}</div>
  );
}

export default ProposalDescription;