import { Box, Text } from '@chakra-ui/react';
import { Input, LabelWrapper, RestrictCharTypes } from '@decent-org/fractal-ui';
import { BigNumber } from 'ethers';
import { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import ContentBanner from '../../ui/ContentBanner';
import ContentBox from '../../ui/ContentBox';
import ContentBoxTitle from '../../ui/ContentBoxTitle';
import InputBox from '../../ui/forms/InputBox';
import { useCreator } from '../provider/hooks/useCreator';
import { CreatorProviderActions, GovernanceTypes } from '../provider/types';

function GovernanceDetails() {
  const {
    state: { govModule, governance },
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
  const seconds = t('seconds');

  return (
    <Box>
      <ContentBox>
        <ContentBoxTitle>Proposal Settings</ContentBoxTitle>
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
              rightElement={seconds}
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
            label={t('labelProposalExecutionDelay', { ns: 'daoCreate' })}
            subLabel={t('helperProposalExecutionDelay', { ns: 'daoCreate' })}
          >
            <Input
              size="base"
              type="number"
              value={govModule.executionDelay.toString()}
              onChange={e => fieldUpdate(BigNumber.from(e.target.value || 0), 'executionDelay')}
              rightElement={seconds}
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
