import {
  Alert,
  AlertTitle,
  Divider,
  Flex,
  InputGroup,
  InputRightElement,
  Text,
} from '@chakra-ui/react';
import { Info } from '@decent-org/fractal-ui';
import { useTranslation } from 'react-i18next';
import { LabelComponent } from '../../ProposalCreate/InputComponent';
import ContentBoxTitle from '../../ui/containers/ContentBox/ContentBoxTitle';
import { BigNumberInput } from '../../ui/forms/BigNumberInput';
import { StepButtons } from '../StepButtons';
import { StepWrapper } from '../StepWrapper';
import { ICreationStepProps, CreatorSteps } from '../types';

export function UsulGovernance(props: ICreationStepProps) {
  const { values, setFieldValue, isSubDAO } = props;
  const { t } = useTranslation(['daoCreate', 'common']);
  const minutes = t('minutes', { ns: 'common' });
  return (
    <StepWrapper titleKey="titleGovConfig">
      <Flex
        flexDirection="column"
        gap={8}
      >
        <ContentBoxTitle>{t('titleProposalSettings', { ns: 'daoCreate' })}</ContentBoxTitle>
        <LabelComponent
          label={t('labelVotingPeriod')}
          helper={t('helperVotingPeriod')}
          isRequired
        >
          <InputGroup>
            <BigNumberInput
              value={values.govModule.votingPeriod.bigNumberValue}
              onChange={valuePair => setFieldValue('govModule.votingPeriod', valuePair)}
              decimalPlaces={0}
              min="1"
              data-testid="govConfig-votingPeriod"
            />
            <InputRightElement mr="4">{minutes}</InputRightElement>
          </InputGroup>
          <Text
            textStyle="text-md-sans-regular"
            color="grayscale.500"
            mt={2}
          >
            {t('exampleVotingPeriod')}
          </Text>
        </LabelComponent>
        <LabelComponent
          label={t('quorum', { ns: 'common' })}
          helper={t('helperQuorum')}
          isRequired
        >
          <InputGroup>
            <BigNumberInput
              value={values.govModule.quorumPercentage.bigNumberValue}
              onChange={valuePair => setFieldValue('govModule.quorumPercentage', valuePair)}
              max="100"
              decimalPlaces={0}
              data-testid="govConfig-quorumPercentage"
            />
            <InputRightElement>%</InputRightElement>
          </InputGroup>
        </LabelComponent>
        <LabelComponent
          label={t('labelTimelockPeriod')}
          helper={t('helperTimelockPeriod')}
          isRequired
        >
          <InputGroup>
            <BigNumberInput
              value={values.govModule.timelock.bigNumberValue}
              onChange={valuePair => setFieldValue('govModule.timelock', valuePair)}
              decimalPlaces={0}
              data-testid="govConfig-timelock"
            />
            <InputRightElement mr="4">{minutes}</InputRightElement>
          </InputGroup>
          <Text
            textStyle="text-md-sans-regular"
            color="grayscale.500"
            mt={2}
          >
            {t('exampleTimelockPeriod')}
          </Text>
        </LabelComponent>
        <Alert status="info">
          <Info boxSize="24px" />
          <AlertTitle>
            <Text
              textStyle="text-lg-mono-medium"
              whiteSpace="pre-wrap"
            >
              {t('governanceDescription')}
            </Text>
          </AlertTitle>
        </Alert>
        <Divider
          color="chocolate.700"
          mb={4}
        />
        <StepButtons
          {...props}
          prevStep={CreatorSteps.ESSENTIALS}
          nextStep={CreatorSteps.GUARD_CONFIG}
          isLastStep={!isSubDAO}
        />
      </Flex>
    </StepWrapper>
  );
}
