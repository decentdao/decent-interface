import { ChangeEvent, useEffect } from 'react';
import ContentBanner from '../ui/ContentBanner';
import ContentBoxTitle from '../ui/ContentBoxTitle';
import Input from '../ui/forms/Input';
import InputBox from '../ui/forms/InputBox';

interface GovernanceDetailsProps {
  proposalThreshold: string;
  quorum: string;
  executionDelay: string;
  lateQuorumExecution: string;
  voteStartDelay: string;
  votingPeriod: string;
  setProposalThreshold: React.Dispatch<React.SetStateAction<string>>;
  setQuorum: React.Dispatch<React.SetStateAction<string>>;
  setExecutionDelay: React.Dispatch<React.SetStateAction<string>>;
  setLateQuorumExecution: React.Dispatch<React.SetStateAction<string>>;
  setVoteStartDelay: React.Dispatch<React.SetStateAction<string>>;
  setVotingPeriod: React.Dispatch<React.SetStateAction<string>>;
  setPrevEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  setDeployEnabled: React.Dispatch<React.SetStateAction<boolean>>;
}

function GovernanceDetails({
  proposalThreshold,
  quorum,
  executionDelay,
  lateQuorumExecution,
  voteStartDelay,
  votingPeriod,
  setProposalThreshold,
  setQuorum,
  setExecutionDelay,
  setLateQuorumExecution,
  setVoteStartDelay,
  setVotingPeriod,
  setPrevEnabled,
  setDeployEnabled,
}: GovernanceDetailsProps) {
  useEffect(() => {
    setPrevEnabled(true);
  }, [setPrevEnabled]);

  useEffect(() => {
    setDeployEnabled(
      Number(proposalThreshold) >= 0 &&
        Number(quorum) >= 0 &&
        Number(quorum) <= 100 &&
        Number(executionDelay) >= 0 &&
        Number(lateQuorumExecution) >= 0 &&
        Number(voteStartDelay) >= 0 &&
        Number(votingPeriod) > 0 &&
        proposalThreshold.trim() !== '' &&
        quorum.trim() !== '' &&
        executionDelay.trim() !== '' &&
        lateQuorumExecution.trim() !== '' &&
        voteStartDelay.trim() !== '' &&
        votingPeriod.trim() !== ''
    );
  }, [
    proposalThreshold,
    quorum,
    executionDelay,
    lateQuorumExecution,
    voteStartDelay,
    votingPeriod,
  ]);

  /// validation
  // proposal creation should not be more than availabe tokens
  const onVotingPeriodChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newVotingPeriod = event.target.value;

    if (Number(newVotingPeriod) > 0 || newVotingPeriod == '') {
      setVotingPeriod(newVotingPeriod);
    }
  };

  const onQuorumChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newQuorumPeriod = event.target.value;

    if (Number(newQuorumPeriod) <= 100) {
      setQuorum(newQuorumPeriod);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2">
        <ContentBoxTitle>Governance Setup</ContentBoxTitle>
      </div>
      <InputBox>
        <Input
          type="number"
          value={proposalThreshold}
          unit="Tokens"
          onChange={e => setProposalThreshold(e.target.value)}
          label="Proposal Creation (# of Tokens Required)"
          exampleLabel="Recommend"
          exampleText="0 Tokens"
          helperText="How many tokens does a member need to have in order to create a new proposal."
          isWholeNumberOnly
          min="0"
        />
      </InputBox>
      <InputBox>
        <Input
          type="number"
          value={voteStartDelay}
          onChange={e => setVoteStartDelay(e.target.value)}
          label="Vote Start Delay"
          exampleLabel="Recommend"
          exampleText="24 Hours / ~6545 Blocks"
          unit="Blocks"
          helperText="How many blocks after a proposal is created, before DAO members may vote on the proposal."
          isWholeNumberOnly
          min="0"
        />
      </InputBox>
      <InputBox>
        <Input
          type="number"
          value={votingPeriod}
          onChange={onVotingPeriodChange}
          label="Voting Period"
          exampleLabel="Recommend"
          exampleText="1 Week / ~45818 Blocks"
          unit="Blocks"
          helperText="The length of time (in blocks) between a vote's starting and ending point. Must be greater than 0."
          isWholeNumberOnly
          min="1"
        />
      </InputBox>
      <InputBox>
        <Input
          type="number"
          value={quorum}
          onChange={onQuorumChange}
          label="Quorum"
          exampleLabel="Recommend"
          exampleText="4%"
          unit="%"
          helperText="The percentage of total votes to total tokens required in order for a proposal to PASS. Must be less than or equal to than 100%"
          isWholeNumberOnly
          min="0"
        />
      </InputBox>
      <InputBox>
        <Input
          type="number"
          value={lateQuorumExecution}
          onChange={e => setLateQuorumExecution(e.target.value)}
          label="Late Quorum Delay"
          exampleLabel="Recommend"
          exampleText="0 Blocks"
          unit="Blocks"
          helperText="Minimum voting period after quorum is reached. 
          This prevents a large voter from swaying a vote and triggering quorum at the last minute."
          isWholeNumberOnly
          min="0"
        />
      </InputBox>
      <InputBox>
        <Input
          type="number"
          value={executionDelay}
          onChange={e => setExecutionDelay(e.target.value)}
          label="Proposal Execution Delay"
          exampleLabel="Recommend"
          exampleText="24 Hours / ~6545 Blocks"
          unit="Blocks"
          helperText="How many hours after a proposal PASSES / QUEUED, must it wait until it can be executed?"
          isWholeNumberOnly
          min="0"
        />
      </InputBox>
      <ContentBanner description="The Governance Setup values are editable at this time. A default value has been placed in each input box. To change these values, a new proposal will need to be created and passed by your members." />
    </div>
  );
}

export default GovernanceDetails;
