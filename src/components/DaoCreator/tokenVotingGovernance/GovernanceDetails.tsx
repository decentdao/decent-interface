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
import { useFormHelpers } from '../../../hooks/utils/useFormHelpers';
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

  const { restrictChars } = useFormHelpers();

  const fieldUpdate = (value: any, field: string) => {
    dispatch({
      type: CreatorProviderActions.UPDATE_GOV_CONFIG,
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

  const onQuorumChange = (quorumPercentage: string) => {
    const newQuorumNum = BigNumber.from(quorumPercentage || 0);
    if (newQuorumNum.lte(100)) {
      fieldUpdate(newQuorumNum, 'quorumPercentage');
    } else {
      fieldUpdate(BigNumber.from(100), 'quorumPercentage');
    }
  };

  const { t } = useTranslation(['daoCreate', 'common']);
  const seconds = t('seconds', { ns: 'common' });

  return (
    <Box>
      <ContentBox>
        <ContentBoxTitle>{t('titleProposalSettings', { ns: 'daoCreate' })}</ContentBoxTitle>
        <InputBox>
          <LabelWrapper
            label={t('labelVotingPeriod')}
            subLabel={t('helperVotingPeriod')}
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
            {t('exampleVotingPeriod')}
          </Text>
        </InputBox>
        <InputBox>
          <LabelWrapper
            label={t('quorum', { ns: 'common' })}
            subLabel={t('helperQuorum')}
          >
            <NumberInput
              value={govModule.quorumPercentage.toString()}
              onChange={onQuorumChange}
              precision={0}
              data-testid="govConfig-quorumPercentage"
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
            label={t('labelTimelockPeriod')}
            subLabel={t('helperTimelockPeriod')}
          >
            <NumberInput
              value={govModule.timelock.toString()}
              onChange={timelock => fieldUpdate(BigNumber.from(timelock || 0), 'timelock')}
              min={isSafeWithUsul ? 2 : 1}
              precision={0}
              data-testid="govConfig-timelock"
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
            {t('exampleTimelockPeriod')}
          </Text>
        </InputBox>
      </ContentBox>
      <ContentBanner description={t('governanceDescription')} />
    </Box>
  );
}

export default GovernanceDetails;
