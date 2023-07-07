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
import { ICreationStepProps, CreatorSteps, VotingStrategyType } from '../../../types';
import ContentBoxTitle from '../../ui/containers/ContentBox/ContentBoxTitle';
import { BigNumberInput } from '../../ui/forms/BigNumberInput';
import { LabelComponent } from '../../ui/forms/InputComponent';
import { StepButtons } from '../StepButtons';
import { StepWrapper } from '../StepWrapper';
import { DAOCreateMode } from './EstablishEssentials';

export function AzoriusGovernance(props: ICreationStepProps) {
  const { values, setFieldValue, isSubmitting, transactionPending, isSubDAO, mode } = props;
  const { t } = useTranslation(['daoCreate', 'common']);
  const minutes = t('minutes', { ns: 'common' });
  return (
    <StepWrapper
      mode={mode}
      titleKey="titleGovConfig"
      isSubDAO={isSubDAO}
      isFormSubmitting={!!isSubmitting || transactionPending}
    >
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
              value={values.azorius.votingPeriod.bigNumberValue}
              onChange={valuePair => setFieldValue('azorius.votingPeriod', valuePair)}
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
        {values.azorius.votingStrategyType === VotingStrategyType.LINEAR_ERC20 ? (
          <LabelComponent
            label={t('quorum', { ns: 'common' })}
            helper={t('helperQuorum')}
            isRequired
          >
            <InputGroup>
              <BigNumberInput
                value={values.azorius.quorumPercentage.bigNumberValue}
                onChange={valuePair => setFieldValue('azorius.quorumPercentage', valuePair)}
                max="100"
                decimalPlaces={0}
                data-testid="govConfig-quorumPercentage"
              />
              <InputRightElement>%</InputRightElement>
            </InputGroup>
          </LabelComponent>
        ) : (
          <LabelComponent
            label={t('quorumThreshold')}
            helper={t('helperQuorumThreshold')}
            isRequired
          >
            <BigNumberInput
              value={values.erc721Token.quorumThreshold.bigNumberValue}
              onChange={valuePair => setFieldValue('erc721Token.quorumThreshold', valuePair)}
              max="100"
              decimalPlaces={0}
              data-testid="govConfig-quorumThreshold"
            />
          </LabelComponent>
        )}
        <LabelComponent
          label={t('labelTimelockPeriod')}
          helper={t('helperTimelockPeriod')}
          isRequired
        >
          <InputGroup>
            <BigNumberInput
              value={values.azorius.timelock.bigNumberValue}
              onChange={valuePair => setFieldValue('azorius.timelock', valuePair)}
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
        <LabelComponent
          label={t('labelExecutionPeriod')}
          helper={t('helperExecutionPeriod')}
          isRequired
        >
          <InputGroup>
            <BigNumberInput
              value={values.azorius.executionPeriod.bigNumberValue}
              onChange={valuePair => setFieldValue('azorius.executionPeriod', valuePair)}
              decimalPlaces={0}
              min="1"
              data-testid="govModule-executionDetails"
            />
            <InputRightElement mr="4">{minutes}</InputRightElement>
          </InputGroup>
          <Text
            textStyle="text-md-sans-regular"
            color="grayscale.500"
            mt={2}
          >
            {t('exampleExecutionPeriod')}
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
          prevStep={
            values.azorius.votingStrategyType === VotingStrategyType.LINEAR_ERC20
              ? CreatorSteps.ERC20_DETAILS
              : CreatorSteps.ERC721_DETAILS
          }
          nextStep={CreatorSteps.FREEZE_DETAILS}
          isLastStep={!isSubDAO}
          isEdit={mode === DAOCreateMode.EDIT}
        />
      </Flex>
    </StepWrapper>
  );
}
