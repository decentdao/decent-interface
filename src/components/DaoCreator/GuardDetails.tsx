import {
  Box,
  Text,
  NumberInput,
  NumberInputField,
  InputGroup,
  InputRightElement,
} from '@chakra-ui/react';
import { LabelWrapper } from '@decent-org/fractal-ui';
import { BigNumber } from 'ethers';
import { useTranslation } from 'react-i18next';
import { useFormHelpers } from '../../hooks/utils/useFormHelpers';
import ContentBanner from '../ui/ContentBanner';
import ContentBox from '../ui/ContentBox';
import ContentBoxTitle from '../ui/ContentBoxTitle';
import InputBox from '../ui/forms/InputBox';
import { useCreator } from './provider/hooks/useCreator';
import { CreatorProviderActions, GovernanceTypes } from './provider/types';

function GuardDetails() {
  const {
    state: { govModule, governance },
    dispatch,
  } = useCreator();

  const isSafeWithUsul = governance === GovernanceTypes.GNOSIS_SAFE_USUL;

  const { restrictChars } = useFormHelpers();

  const fieldUpdate = (value: any, field: string) => {
    dispatch({
      type: CreatorProviderActions.UPDATE_GUARD_CONFIG,
      payload: {
        [field]: value,
      },
    });
  };

  const onVotingPeriodChange = (votingPeriod: string) => {
    const newVotingPeriod = BigNumber.from(votingPeriod || 0);

    if (newVotingPeriod.gt(0)) {
      fieldUpdate(newVotingPeriod, 'votingPeriod');
    }
  };

  const onQuorumChange = (quorum: string) => {
    const newQuorumNum = BigNumber.from(quorum || 0);
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
        <ContentBoxTitle>Veto Guard Settings</ContentBoxTitle>
        <InputBox>
          <LabelWrapper
            label={t('labelVotingPeriod', { ns: 'daoCreate' })}
            subLabel={t('helperVotingPeriod', { ns: 'daoCreate' })}
          >
            <NumberInput
              value={govModule.votingPeriod.toString()}
              onChange={onVotingPeriodChange}
              min={isSafeWithUsul ? 2 : 1}
              precision={0}
              data-testid="govConfig-votingPeriod"
              onKeyDown={restrictChars}
            >
              <InputGroup>
                <NumberInputField />
                <InputRightElement mr="4">{seconds}</InputRightElement>
              </InputGroup>
            </NumberInput>
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
            <NumberInput
              value={govModule.quorum.toString()}
              onChange={onQuorumChange}
              precision={0}
              data-testid="govConfig-quorum"
              onKeyDown={restrictChars}
            >
              <InputGroup>
                <NumberInputField />
                <InputRightElement>%</InputRightElement>
              </InputGroup>
            </NumberInput>
          </LabelWrapper>
        </InputBox>
        <InputBox>
          <LabelWrapper
            label={t('labelProposalExecutionDelay', { ns: 'daoCreate' })}
            subLabel={t('helperProposalExecutionDelay', { ns: 'daoCreate' })}
          >
            <NumberInput
              value={govModule.executionDelay.toString()}
              onChange={executionDelay =>
                fieldUpdate(BigNumber.from(executionDelay || 0), 'executionDelay')
              }
              min={isSafeWithUsul ? 2 : 1}
              precision={0}
              data-testid="govConfig-executionDelay"
              onKeyDown={restrictChars}
            >
              <InputGroup>
                <NumberInputField />
                <InputRightElement mr="4">{seconds}</InputRightElement>
              </InputGroup>
            </NumberInput>
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

export default GuardDetails;
