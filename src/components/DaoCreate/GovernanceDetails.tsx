import { useEffect } from 'react';
import ContentBanner from '../ui/ContentBanner';
import ContentBoxTitle from '../ui/ContentBoxTitle';
import Input from '../ui/forms/Input';
import InputBox from '../ui/forms/InputBox';
import Lock from '../ui/svg/Lock';

function GovernanceDetails({
  setPrevEnabled,
  proposalThreshold,
  quorum,
  executionDelay,
}: {
  setPrevEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  proposalThreshold: number | undefined;
  quorum: number | undefined;
  executionDelay: number | undefined;
}) {
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
          type="text"
          value={proposalThreshold?.toString()}
          unit="Tokens"
          onChange={() => {}}
          label="Proposal Creation (Token Required)"
          helperText="How many tokens does a member need to have in order to create a new proposal. Recommend: 0 Tokens"
          disabled={true}
        />
      </InputBox>
      <InputBox>
        <Input
          type="text"
          value={quorum?.toString()}
          onChange={() => {}}
          label="Quorum"
          unit="%"
          helperText="The percentage of total votes required in order for a proposal to PASS. Recommend: 4%"
          disabled={true}
        />
      </InputBox>
      <InputBox>
        <Input
          type="text"
          value={executionDelay?.toString()}
          onChange={() => {}}
          label="Execution Delay"
          unit="Hours"
          helperText="How many hours after a proposal PASSES, must it wait until it can be executed?
          Recommend: 24 Hours"
          disabled={true}
        />
      </InputBox>
      <ContentBanner description="The Governance Setup values are not editable at this time. To change these values, a new proposal will need to be created and passed by your members." />
    </div>
  );
}

export default GovernanceDetails;
