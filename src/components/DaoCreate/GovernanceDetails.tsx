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
}: GovernanceDetailsProps) {
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
          value={proposalThreshold}
          unit="Tokens"
          onChange={e => setProposalThreshold(e.target.value)}
          label="Proposal Creation (# of Tokens Required)"
          helperText="How many tokens does a member need to have in order to create a new proposal. Recommend: 0 Tokens"
        />
      </InputBox>
      <InputBox>
        <Input
          type="text"
          value={voteStartDelay}
          onChange={e => setVoteStartDelay(e.target.value)}
          label="Vote Start Delay"
          unit="Blocks"
          helperText="How many blocks after a proposal is created, before DAO members may vote on the proposal
          Recommend: 24 Hours / ~6545 Blocks"
        />
      </InputBox>
      <InputBox>
        <Input
          type="text"
          value={votingPeriod}
          onChange={e => setVotingPeriod(e.target.value)}
          label="Voting Period"
          unit="Blocks"
          helperText="The length of time (in blocks) between a vote's starting and ending point
          Recommend: 1 Week / ~45818 Blocks"
        />
      </InputBox>
      <InputBox>
        <Input
          type="text"
          value={quorum}
          onChange={e => setQuorum(e.target.value)}
          label="Quorum"
          unit="%"
          helperText="The percentage of total votes to total tokens required in order for a proposal to PASS. Recommend: 4%"
        />
      </InputBox>
      <InputBox>
        <Input
          type="text"
          value={lateQuorumExecution}
          onChange={e => setLateQuorumExecution(e.target.value)}
          label="Late Quorum Delay"
          unit="Blocks"
          helperText="Minimum voting period after quorum is reached. 
          This prevents a large voter from swaying a vote and triggering quorum at the last minute.
          Recommend: 0 Blocks"
        />
      </InputBox>
      <InputBox>
        <Input
          type="text"
          value={executionDelay}
          onChange={e => setExecutionDelay(e.target.value)}
          label="Proposal Execution Delay"
          unit="Blocks"
          helperText="How many hours after a proposal PASSES / QUEUED, must it wait until it can be executed?
          Recommend: 24 Hours / ~6545 Blocks"
        />
      </InputBox>
      <ContentBanner description="The Governance Setup values are editable at this time. A default value has been placed in each input box. To change these values, a new proposal will need to be created and passed by your members." />
    </div>
  );
}

export default GovernanceDetails;
