import { ChangeEvent } from 'react';
import ContentBanner from '../ui/ContentBanner';
import ContentBox from '../ui/ContentBox';
import ContentBoxTitle from '../ui/ContentBoxTitle';
import Input from '../ui/forms/Input';
import InputBox from '../ui/forms/InputBox';
import { useCreator } from './provider/hooks/useCreator';
import { CreatorProviderActions } from './provider/types';

function GovernanceDetails() {
  const {
    state: { govModule, govToken },
    dispatch,
  } = useCreator();

  const fieldUpdate = (value: any, field: string) => {
    dispatch({
      type: CreatorProviderActions.UPDATE_GOV_CONFIG,
      payload: {
        [field]: value,
      },
    });
  };

  // useEffect(() => {
  //   setDeployEnabled(
  //     Number(proposalThreshold) >= 0 &&
  //       Number(quorum) >= 0 &&
  //       Number(quorum) <= 100 &&
  //       Number(executionDelay) >= 0 &&
  //       Number(lateQuorumExecution) >= 0 &&
  //       Number(voteStartDelay) >= 0 &&
  //       Number(votingPeriod) > 0 &&
  //       proposalThreshold.trim() !== '' &&
  //       quorum.trim() !== '' &&
  //       executionDelay.trim() !== '' &&
  //       lateQuorumExecution.trim() !== '' &&
  //       voteStartDelay.trim() !== '' &&
  //       votingPeriod.trim() !== ''
  //   );
  // }, [
  //   proposalThreshold,
  //   quorum,
  //   executionDelay,
  //   lateQuorumExecution,
  //   voteStartDelay,
  //   votingPeriod,
  //   setDeployEnabled,
  // ]);

  const onThresholdChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newThreshold = event.target.value;
    if (Number(newThreshold) <= Number(govToken.tokenSupply)) {
      fieldUpdate(newThreshold, 'proposalThreshold');
    } else {
      fieldUpdate(govToken.tokenSupply, 'proposalThreshold');
    }
  };

  const onVotingPeriodChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newVotingPeriod = event.target.value;

    if (Number(newVotingPeriod) > 0 || newVotingPeriod == '') {
      fieldUpdate(newVotingPeriod, 'votingPeriod');
    }
  };

  const onQuorumChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newQuorumNum = event.target.value;
    if (Number(newQuorumNum) <= 100) {
      fieldUpdate(newQuorumNum, 'quorum');
    } else {
      fieldUpdate('100', 'quorum');
    }
  };

  return (
    <div>
      <ContentBox>
        <div className="flex items-center gap-2">
          <ContentBoxTitle>Proposal Settings</ContentBoxTitle>
        </div>
        <InputBox>
          <Input
            type="number"
            value={govModule.proposalThreshold}
            unit="Tokens"
            onChange={onThresholdChange}
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
            value={govModule.voteStartDelay}
            onChange={e => fieldUpdate(e.target.value, 'voteStartDelay')}
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
            value={govModule.votingPeriod}
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
        <ContentBoxTitle>Governance Setup</ContentBoxTitle>
        <InputBox>
          <Input
            type="number"
            value={govModule.quorum}
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
            value={govModule.lateQuorumExecution}
            onChange={e => fieldUpdate(e.target.value, 'lateQuorumExecution')}
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
            value={govModule.executionDelay}
            onChange={e => fieldUpdate(e.target.value, 'executionDelay')}
            label="Proposal Execution Delay"
            exampleLabel="Recommend"
            exampleText="24 Hours / ~6545 Blocks"
            unit="Blocks"
            helperText="How many hours after a proposal PASSES / QUEUED, must it wait until it can be executed?"
            isWholeNumberOnly
            min="0"
          />
        </InputBox>
      </ContentBox>
      <ContentBanner description="The Governance Setup values are editable at this time. A default value has been placed in each input box. To change these values, a new proposal will need to be created and passed by your members." />
    </div>
  );
}

export default GovernanceDetails;
