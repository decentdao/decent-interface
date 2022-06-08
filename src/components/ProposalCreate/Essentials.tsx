import ContentBox from '../ui/ContentBox';
import ContentBoxTitle from '../ui/ContentBoxTitle';
import Input from '../ui/forms/Input';
import InputBox from '../ui/forms/InputBox';

function Essentials({
  proposalDescription,
  setProposalDescription,
}: {
  proposalDescription: string;
  setProposalDescription: React.Dispatch<React.SetStateAction<string>>;
}) {
  return (
    <ContentBox>
      <ContentBoxTitle>Essentials</ContentBoxTitle>
      <InputBox>
        <Input
          type="text"
          value={proposalDescription}
          onChange={e => setProposalDescription(e.target.value)}
          label="Proposal Description"
          helperText="What's the goal of this proposal? Explain the desired outcome and why it matters"
          disabled={false}
        />
      </InputBox>
    </ContentBox>
  );
}

export default Essentials;
