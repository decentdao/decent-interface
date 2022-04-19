import CreateDAOInput from "../../../../ui/CreateDAOInput";

const Essentials = ({
  proposalDescription,
  setProposalDescription,
}: {
  proposalDescription: string;
  setProposalDescription: React.Dispatch<React.SetStateAction<string>>;
}) => {
  return (
    <div className="mx-auto bg-slate-100 px-8 mt-4 mb-8 pt-8 pb-8 content-center">
      <div className="pb-8 text-lg">Essentials</div>
      <CreateDAOInput
        dataType="text"
        value={proposalDescription}
        onChange={(e) => setProposalDescription(e)}
        label="Proposal Description"
        helperText="What's the goal of this proposal? Explain the desired outcome and why it matters"
        disabled={false}
      />
    </div>
  );
};

export default Essentials;
