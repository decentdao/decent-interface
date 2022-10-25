import { ChangeEvent } from 'react';
import { BigNumber } from 'ethers';
import ContentBanner from '../../ui/ContentBanner';
import ContentBox from '../../ui/ContentBox';
import ContentBoxTitle from '../../ui/ContentBoxTitle';
import InputBox from '../../ui/forms/InputBox';
import { useCreator } from '../provider/hooks/useCreator';
import { CreatorProviderActions, GovernanceTypes } from '../provider/types';
import { useTranslation } from 'react-i18next';
import { Box, Text } from '@chakra-ui/react';
import { Input, LabelWrapper, RestrictCharTypes } from '@decent-org/fractal-ui';

function GovernanceDetails() {
  const {
    state: { govModule, govToken, governance },
    dispatch,
  } = useCreator();

  const isSafeWithUsul = governance === GovernanceTypes.GNOSIS_SAFE_USUL;

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
  const blocks = t('blocks');

  return (
    <Box>
      <ContentBox>
        <ContentBoxTitle>Proposal Settings</ContentBoxTitle>
        <InputBox>
          <LabelWrapper
            label={t('labelProposalRequirement', { ns: 'daoCreate' })}
            subLabel={t('helperProposalRequirement', { ns: 'daoCreate' })}
          >
            <Input
              size="base"
              type="number"
              value={govModule.proposalThreshold.toString()}
              rightElement={t('tokens')}
              onChange={onThresholdChange}
              restrictChar={RestrictCharTypes.WHOLE_NUMBERS_ONLY}
              min="0"
              data-testid="govConfig-proposalThreshold"
            />
          </LabelWrapper>
        </InputBox>
        <InputBox>
          <LabelWrapper
            label={t('labelVoteStartDelay', { ns: 'daoCreate' })}
            subLabel={t('helperVoteStartDelay', { ns: 'daoCreate' })}
          >
            <Input
              size="base"
              type="number"
              value={govModule.voteStartDelay.toString()}
              onChange={e => fieldUpdate(BigNumber.from(e.target.value || 0), 'voteStartDelay')}
              rightElement={blocks}
              restrictChar={RestrictCharTypes.WHOLE_NUMBERS_ONLY}
              min="0"
              data-testid="govConfig-voteStartDelay"
            />
          </LabelWrapper>
          <Text
            textStyle="text-sm-sans-regular"
            color="gold.400"
          >
            {t('exampleVoteStartDelay', { ns: 'daoCreate' })}
          </Text>
        </InputBox>
        <InputBox>
          <LabelWrapper
            label={t('labelVotingPeriod', { ns: 'daoCreate' })}
            subLabel={t('helperVotingPeriod', { ns: 'daoCreate' })}
          >
            <Input
              size="base"
              type="number"
              value={govModule.votingPeriod.toString()}
              onChange={onVotingPeriodChange}
              rightElement={blocks}
              restrictChar={RestrictCharTypes.WHOLE_NUMBERS_ONLY}
              min={isSafeWithUsul ? '2' : '1'}
              data-testid="govConfig-votingPeriod"
            />
          </LabelWrapper>
          <Text
            textStyle="text-sm-sans-regular"
            color="gold.400"
          >
            {t('exampleVotingPeriod', { ns: 'daoCreate' })}
          </Text>
        </InputBox>
        <ContentBoxTitle>Governance Setup</ContentBoxTitle>
        <InputBox>
          <LabelWrapper
            label={t('quorum')}
            subLabel={t('helperQuorum', { ns: 'daoCreate' })}
          >
            <Input
              size="base"
              type="number"
              value={govModule.quorum.toString()}
              onChange={onQuorumChange}
              rightElement="%"
              restrictChar={RestrictCharTypes.WHOLE_NUMBERS_ONLY}
              min="0"
              data-testid="govConfig-quorum"
            />
          </LabelWrapper>
        </InputBox>
        <InputBox>
          <LabelWrapper
            label={t('labelLateQuorumDelay', { ns: 'daoCreate' })}
            subLabel={t('helperLateQuorumDelay', { ns: 'daoCreate' })}
          >
            <Input
              size="base"
              type="number"
              value={govModule.lateQuorumExecution.toString()}
              onChange={e =>
                fieldUpdate(BigNumber.from(e.target.value || 0), 'lateQuorumExecution')
              }
              label={t('labelLateQuorumDelay', { ns: 'daoCreate' })}
              rightElement={blocks}
              min="0"
              data-testid="govConfig-lateQuorumExecution"
            />
          </LabelWrapper>
        </InputBox>
        <InputBox>
          <LabelWrapper
            label={t('labelProposalExecutionDelay', { ns: 'daoCreate' })}
            subLabel={t('helperProposalExecutionDelay', { ns: 'daoCreate' })}
          >
            <Input
              size="base"
              type="number"
              value={govModule.executionDelay.toString()}
              onChange={e => fieldUpdate(BigNumber.from(e.target.value || 0), 'executionDelay')}
              rightElement={blocks}
              restrictChar={RestrictCharTypes.WHOLE_NUMBERS_ONLY}
              min="0"
              data-testid="govConfig-executionDelay"
            />
          </LabelWrapper>
          <Text
            textStyle="text-sm-sans-regular"
            color="gold.400"
          >
            {t('exampleProposalExecutionDelay', { ns: 'daoCreate' })}
          </Text>
        </InputBox>
      </ContentBox>
      <ContentBanner description={t('governanceDescription', { ns: 'daoCreate' })} />
    </Box>
  );
}

export default GovernanceDetails;
