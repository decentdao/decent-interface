import { useEffect } from "react";
import ContentBoxTitle from "../../ui/ContentBoxTitle";
import Input from "../../ui/forms/Input";
import InputBox from "../../ui/forms/InputBox";

const GovernanceDetails = ({
  setPrevEnabled,
  proposalThreshold,
  quorum,
  executionDelay,
}: {
  setPrevEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  proposalThreshold: number | undefined;
  quorum: number | undefined;
  executionDelay: number | undefined;
}) => {
  useEffect(() => {
    setPrevEnabled(true);
  }, [setPrevEnabled]);

  return (
    <div>
      <ContentBoxTitle>Governance Setup</ContentBoxTitle>
      <InputBox>
        <Input
          type="text"
          value={proposalThreshold?.toString()}
          onChange={() => {}}
          label="Proposal Threshold"
          helperText="How many tokens does it take to create a proposal?"
          disabled={true}
        />
      </InputBox>
      <InputBox>
        <Input
          type="text"
          value={quorum?.toString()}
          onChange={() => {}}
          label="Quorum"
          helperText="What percentage of token votes are required in order for a proposal to pass"
          disabled={true}
        />
      </InputBox>
      <InputBox>
        <Input
          type="text"
          value={executionDelay?.toString()}
          onChange={() => {}}
          label="Execution Delay"
          helperText="How long after a proposal passes must people wait until it can be executed?"
          disabled={true}
        />
      </InputBox>
    </div>
  );
};

export default GovernanceDetails;
