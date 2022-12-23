import { Box, Text, InputGroup, InputRightElement } from '@chakra-ui/react';
import { LabelWrapper } from '@decent-org/fractal-ui';
import { useTranslation } from 'react-i18next';
import { BigNumberInput } from '../../ui/BigNumberInput';
import ContentBanner from '../../ui/ContentBanner';
import ContentBox from '../../ui/ContentBox';
import ContentBoxTitle from '../../ui/ContentBoxTitle';
import InputBox from '../../ui/forms/InputBox';
import { useCreator } from '../provider/hooks/useCreator';
import { CreatorProviderActions } from '../provider/types';

function GovernanceDetails() {
  const {
    state: { govModule },
    dispatch,
  } = useCreator();

  const fieldUpdate = (key: string, value: any) => {
    dispatch({
      type: CreatorProviderActions.UPDATE_GOV_CONFIG,
      payload: {
        [key]: value,
      },
    });
  };

  const { t } = useTranslation(['daoCreate', 'common']);
  const minutes = t('minutes', { ns: 'common' });

  return (
    <Box>
      <ContentBox>
        <ContentBoxTitle>{t('titleProposalSettings', { ns: 'daoCreate' })}</ContentBoxTitle>
        <InputBox>
          <LabelWrapper
            label={t('labelVotingPeriod')}
            subLabel={t('helperVotingPeriod')}
          >
            <InputGroup>
              <BigNumberInput
                value={govModule.votingPeriod}
                onChange={value => fieldUpdate('votingPeriod', value.bigNumberValue)}
                decimalPlaces={0}
                min="1"
                data-testid="govConfig-votingPeriod"
              />
              <InputRightElement mr="4">{minutes}</InputRightElement>
            </InputGroup>
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
            <InputGroup>
              <BigNumberInput
                value={govModule.quorumPercentage}
                onChange={value => fieldUpdate('quorumPercentage', value.bigNumberValue)}
                max="100"
                decimalPlaces={0}
                data-testid="govConfig-quorumPercentage"
              />
              <InputRightElement>%</InputRightElement>
            </InputGroup>
          </LabelWrapper>
        </InputBox>
        <InputBox>
          <LabelWrapper
            label={t('labelTimelockPeriod')}
            subLabel={t('helperTimelockPeriod')}
          >
            <InputGroup>
              <BigNumberInput
                value={govModule.timelock}
                onChange={value => fieldUpdate('timelock', value.bigNumberValue)}
                decimalPlaces={0}
                data-testid="govConfig-timelock"
              />
              <InputRightElement mr="4">{minutes}</InputRightElement>
            </InputGroup>
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
