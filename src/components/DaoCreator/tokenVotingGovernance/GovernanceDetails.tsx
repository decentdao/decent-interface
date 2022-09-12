import { ChangeEvent } from 'react';
import { BigNumber } from 'ethers';
import ContentBanner from '../../ui/ContentBanner';
import ContentBox from '../../ui/ContentBox';
import ContentBoxTitle from '../../ui/ContentBoxTitle';
import Input, { RestrictCharTypes } from '../../ui/forms/Input';
import InputBox from '../../ui/forms/InputBox';
import { useCreator } from '../provider/hooks/useCreator';
import { CreatorProviderActions } from '../provider/types';

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

  const onThresholdChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newThreshold = BigNumber.from(event.target.value || 0);
    if (newThreshold.lte(govToken.tokenSupply.bigNumberValue!)) {
      fieldUpdate(newThreshold, 'proposalThreshold');
    } else {
      fieldUpdate(govToken.tokenSupply, 'proposalThreshold');
    }
  };

  const onVotingPeriodChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newVotingPeriod = BigNumber.from(event.target.value || 0);

    if (newVotingPeriod.gt(0)) {
      fieldUpdate(newVotingPeriod, 'votingPeriod');
    }
  };

  const onQuorumChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newQuorumNum = BigNumber.from(event.target.value || 0);
    if (newQuorumNum.lte(100)) {
      fieldUpdate(newQuorumNum, 'quorum');
    } else {
      fieldUpdate(BigNumber.from(100), 'quorum');
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
            value={govModule.proposalThreshold.toString()}
            unit="Tokens"
            onChange={onThresholdChange}
            label="Proposal Creation (# of Tokens Required)"
            exampleLabel="Recommend"
            exampleText="0 Tokens"
            helperText="How many tokens does a member need to have in order to create a new proposal."
            restrictChar={RestrictCharTypes.WHOLE_NUMBERS_ONLY}
            min="0"
          />
        </InputBox>
        <InputBox>
          <Input
            type="number"
            value={govModule.voteStartDelay.toString()}
            onChange={e => fieldUpdate(BigNumber.from(e.target.value || 0), 'voteStartDelay')}
            label="Vote Start Delay"
            exampleLabel="Recommend"
            exampleText="24 Hours / ~6545 Blocks"
            unit="Blocks"
            helperText="How many blocks after a proposal is created, before DAO members may vote on the proposal."
            restrictChar={RestrictCharTypes.WHOLE_NUMBERS_ONLY}
            min="0"
          />
        </InputBox>
        <InputBox>
          <Input
            type="number"
            value={govModule.votingPeriod.toString()}
            onChange={onVotingPeriodChange}
            label="Voting Period"
            exampleLabel="Recommend"
            exampleText="1 Week / ~45818 Blocks"
            unit="Blocks"
            helperText="The length of time (in blocks) between a vote's starting and ending point. Must be greater than 0."
            restrictChar={RestrictCharTypes.WHOLE_NUMBERS_ONLY}
            min="1"
          />
        </InputBox>
        <ContentBoxTitle>Governance Setup</ContentBoxTitle>
        <InputBox>
          <Input
            type="number"
            value={govModule.quorum.toString()}
            onChange={onQuorumChange}
            label="Quorum"
            exampleLabel="Recommend"
            exampleText="4%"
            unit="%"
            helperText="The percentage of total votes to total tokens required in order for a proposal to PASS. Must be less than or equal to than 100%"
            restrictChar={RestrictCharTypes.WHOLE_NUMBERS_ONLY}
            min="0"
          />
        </InputBox>
        <InputBox>
          <Input
            type="number"
            value={govModule.lateQuorumExecution.toString()}
            onChange={e => fieldUpdate(BigNumber.from(e.target.value || 0), 'lateQuorumExecution')}
            label="Late Quorum Delay"
            exampleLabel="Recommend"
            exampleText="0 Blocks"
            unit="Blocks"
            helperText="Minimum voting period after quorum is reached. 
          This prevents a large voter from swaying a vote and triggering quorum at the last minute."
            restrictChar={RestrictCharTypes.WHOLE_NUMBERS_ONLY}
            min="0"
          />
        </InputBox>
        <InputBox>
          <Input
            type="number"
            value={govModule.executionDelay.toString()}
            onChange={e => fieldUpdate(BigNumber.from(e.target.value || 0), 'executionDelay')}
            label="Proposal Execution Delay"
            exampleLabel="Recommend"
            exampleText="24 Hours / ~6545 Blocks"
            unit="Blocks"
            helperText="How many hours after a proposal PASSES / QUEUED, must it wait until it can be executed?"
            restrictChar={RestrictCharTypes.WHOLE_NUMBERS_ONLY}
            min="0"
          />
        </InputBox>
      </ContentBox>
      <ContentBanner description="The Governance Setup values are editable at this time. A default value has been placed in each input box. To change these values, a new proposal will need to be created and passed by your members." />
    </div>
  );
}

export default GovernanceDetails;
