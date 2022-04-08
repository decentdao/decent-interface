import { useEffect } from 'react';
import CreateDAOInput from '../../ui/CreateDAOInput';

const GovernanceDetails = ({
  setPrevEnabled,
  proposalThreshold,
  quorum,
  executionDelay,
}: {
  setPrevEnabled: React.Dispatch<React.SetStateAction<boolean>>,
  proposalThreshold: number | undefined,
  quorum: number | undefined,
  executionDelay: number | undefined,
}) => {

  useEffect(() => {
    setPrevEnabled(true);
  }, [setPrevEnabled]);

  return (
    <div>
      <div className="pb-8 text-lg">Governance Setup</div>
      <CreateDAOInput
        dataType="text"
        value={proposalThreshold?.toString()}
        onChange={() => { }}
        label="Proposal Threshold"
        helperText="How many tokens does it take to create a proposal?"
        disabled={true}
      />
      <CreateDAOInput
        dataType="text"
        value={quorum?.toString()}
        onChange={() => { }}
        label="Quorum"
        helperText="What percentage of token votes are required in order for a proposal to pass"
        disabled={true}
      />
      <CreateDAOInput
        dataType="text"
        value={executionDelay?.toString()}
        onChange={() => { }}
        label="Execution Delay"
        helperText="How long after a proposal passes must people wait until it can be executed?"
        disabled={true}
      />
    </div>
  );
}

export default GovernanceDetails;
