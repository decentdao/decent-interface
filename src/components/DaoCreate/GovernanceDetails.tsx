import { useEffect } from 'react';
import ContentBanner from '../ui/ContentBanner';
import ContentBoxTitle from '../ui/ContentBoxTitle';
import Input from '../ui/forms/Input';
import InputBox from '../ui/forms/InputBox';
import Lock from '../ui/svg/Lock';

interface GovernanceDetailsProps {
  proposalThreshold: string;
  quorum: string;
  executionDelay: string;
  setProposalThreshold: React.Dispatch<React.SetStateAction<string>>;
  setQuorum: React.Dispatch<React.SetStateAction<string>>;
  setExecutionDelay: React.Dispatch<React.SetStateAction<string>>;
  setPrevEnabled: React.Dispatch<React.SetStateAction<boolean>>;
}

function GovernanceDetails({
  proposalThreshold,
  quorum,
  executionDelay,
  setProposalThreshold,
  setQuorum,
  setExecutionDelay,
  setPrevEnabled,
} : GovernanceDetailsProps) {
  useEffect(() => {
    setPrevEnabled(true);
  }, [setPrevEnabled]);

  return (
    <div>
      <div className="flex items-center gap-2">
        <ContentBoxTitle>Governance Setup</ContentBoxTitle>
        <Lock />
      </div>
      <InputBox>
        <Input
          type="number"
          value={proposalThreshold}
          unit="Tokens"
          onChange={e => setProposalThreshold(e.target.value)}
          label="Proposal Creation (Token Required)"
          helperText="How many tokens does a member need to have in order to create a new proposal. Recommend: 0 Tokens"
        />
      </InputBox>
      <InputBox>
        <Input
          type="number"
          value={quorum}
          onChange={e => setQuorum(e.target.value)}
          label="Quorum"
          unit="%"
          helperText="The percentage of total votes required in order for a proposal to PASS. Recommend: 4%"
        />
      </InputBox>
      <InputBox>
        <Input
          type="number"
          value={executionDelay}
          onChange={e => setExecutionDelay(e.target.value)}
          label="Execution Delay"
          unit="Hours"
          helperText="How many hours after a proposal PASSES, must it wait until it can be executed?
          Recommend: 24 Hours"
        />
      </InputBox>
      <ContentBanner description="The Governance Setup values are not editable at this time. To change these values, a new proposal will need to be created and passed by your members." />
    </div>
  );
}

export default GovernanceDetails;
