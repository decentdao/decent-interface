import { ChangeEvent } from 'react';
import { BigNumber } from 'ethers';
import ContentBanner from '../../ui/ContentBanner';
import ContentBox from '../../ui/ContentBox';
import ContentBoxTitle from '../../ui/ContentBoxTitle';
import Input, { RestrictCharTypes } from '../../ui/forms/Input';
import InputBox from '../../ui/forms/InputBox';
import { useCreator } from '../provider/hooks/useCreator';
import { CreatorProviderActions } from '../provider/types';
import { useTranslation } from 'react-i18next';

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

  const { t } = useTranslation(['common', 'daoCreate']);
  const recommend = t('recommend');
  const blocks = t('blocks');

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
            unit={t('tokens')}
            onChange={onThresholdChange}
            label={t('labelProposalRequirement', { ns: 'daoCreate' })}
            exampleLabel={recommend}
            exampleText={t('exampleProposalRequirement', { ns: 'daoCreate' })}
            helperText={t('helperProposalRequirement', { ns: 'daoCreate' })}
            restrictChar={RestrictCharTypes.WHOLE_NUMBERS_ONLY}
            min="0"
          />
        </InputBox>
        <InputBox>
          <Input
            type="number"
            value={govModule.voteStartDelay.toString()}
            onChange={e => fieldUpdate(BigNumber.from(e.target.value || 0), 'voteStartDelay')}
            label={t('labelVoteStartDelay', { ns: 'daoCreate' })}
            exampleLabel={recommend}
            exampleText={t('exampleVoteStartDelay', { ns: 'daoCreate' })}
            unit={blocks}
            helperText={t('helperVoteStartDelay', { ns: 'daoCreate' })}
            restrictChar={RestrictCharTypes.WHOLE_NUMBERS_ONLY}
            min="0"
          />
        </InputBox>
        <InputBox>
          <Input
            type="number"
            value={govModule.votingPeriod.toString()}
            onChange={onVotingPeriodChange}
            label={t('labelVotingPeriod', { ns: 'daoCreate' })}
            exampleLabel={recommend}
            exampleText={t('exampleVotingPeriod', { ns: 'daoCreate' })}
            unit={blocks}
            helperText={t('helperVotingPeriod', { ns: 'daoCreate' })}
            restrictChar={RestrictCharTypes.WHOLE_NUMBERS_ONLY}
            min="2"
          />
        </InputBox>
        <ContentBoxTitle>Governance Setup</ContentBoxTitle>
        <InputBox>
          <Input
            type="number"
            value={govModule.quorum.toString()}
            onChange={onQuorumChange}
            label={t('quorum')}
            exampleLabel={recommend}
            exampleText={t('exampleQuorum', { ns: 'daoCreate' })}
            unit="%"
            helperText={t('helperQuorum', { ns: 'daoCreate' })}
            restrictChar={RestrictCharTypes.WHOLE_NUMBERS_ONLY}
            min="0"
          />
        </InputBox>
        <InputBox>
          <Input
            type="number"
            value={govModule.lateQuorumExecution.toString()}
            onChange={e => fieldUpdate(BigNumber.from(e.target.value || 0), 'lateQuorumExecution')}
            label={t('labelLateQuorumDelay', { ns: 'daoCreate' })}
            exampleLabel={recommend}
            exampleText={t('exampleLateQuorumDelay', { ns: 'daoCreate' })}
            unit={blocks}
            helperText={t('helperLateQuorumDelay', { ns: 'daoCreate' })}
            restrictChar={RestrictCharTypes.WHOLE_NUMBERS_ONLY}
            min="0"
          />
        </InputBox>
        <InputBox>
          <Input
            type="number"
            value={govModule.executionDelay.toString()}
            onChange={e => fieldUpdate(BigNumber.from(e.target.value || 0), 'executionDelay')}
            label={t('labelProposalExecutionDelay', { ns: 'daoCreate' })}
            exampleLabel={recommend}
            exampleText={t('exampleProposalExecutionDelay', { ns: 'daoCreate' })}
            unit={blocks}
            helperText={t('helperProposalExecutionDelay', { ns: 'daoCreate' })}
            restrictChar={RestrictCharTypes.WHOLE_NUMBERS_ONLY}
            min="0"
          />
        </InputBox>
      </ContentBox>
      <ContentBanner description={t('governanceDescription', { ns: 'daoCreate' })} />
    </div>
  );
}

export default GovernanceDetails;
