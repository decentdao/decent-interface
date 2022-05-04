function ProposalNumber({ proposalNumber, textSize }: { proposalNumber: number, textSize?:string }) {

  return (
    <div className={`px-4 text-gray-25 ${textSize}`}>#{proposalNumber}</div>
  );
}

export default ProposalNumber;