// @todo Governance details
// @todo refactor form object into 2 parts gnosis | usul

import {
  Alert,
  AlertTitle,
  Button,
  Divider,
  Flex,
  InputGroup,
  InputRightElement,
  Text,
} from '@chakra-ui/react';
import { Info } from '@decent-org/fractal-ui';
import { Field, FieldAttributes } from 'formik';
import { useTranslation } from 'react-i18next';
import { LabelComponent } from '../ProposalCreate/InputComponent';
import ContentBoxTitle from '../ui/containers/ContentBox/ContentBoxTitle';
import { StepWrapper } from './StepWrapper';
import { BigNumberInput } from './refactor/BigNumberInput';
import { ICreationStepProps, CreatorSteps } from './types';

// @todo finish and deploy baby
export function UsulGovernance({ errors, updateStep }: ICreationStepProps) {
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
          <Field name="govModule.votingPeriod">
            {({ field }: FieldAttributes<any>) => (
              <InputGroup>
                <BigNumberInput
                  {...field}
                  decimalPlaces={0}
                  min="1"
                  data-testid="govConfig-votingPeriod"
                />
                <InputRightElement mr="4">{minutes}</InputRightElement>
              </InputGroup>
            )}
          </Field>
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
          <Field name="govModule.quorumPercentage">
            {({ field }: FieldAttributes<any>) => (
              <InputGroup>
                <BigNumberInput
                  {...field}
                  max="100"
                  decimalPlaces={0}
                  data-testid="govConfig-quorumPercentage"
                />
                <InputRightElement>%</InputRightElement>
              </InputGroup>
            )}
          </Field>
        </LabelComponent>
        <LabelComponent
          label={t('labelTimelockPeriod')}
          helper={t('helperTimelockPeriod')}
          isRequired
        >
          <Field name="govModule.timelock">
            {({ field }: FieldAttributes<any>) => (
              <InputGroup>
                <BigNumberInput
                  {...field}
                  decimalPlaces={0}
                  data-testid="govConfig-timelock"
                />
                <InputRightElement mr="4">{minutes}</InputRightElement>
              </InputGroup>
            )}
          </Field>
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
        <Divider color="chocolate.700" />
        <Flex alignItems="center">
          <Button
            variant="text"
            onClick={() => updateStep(CreatorSteps.ESSENTIALS)}
          >
            {t('prev', { ns: 'common' })}
          </Button>
          <Button
            w="full"
            disabled={!!errors.govModule}
            onClick={() => updateStep(CreatorSteps.GOV_CONFIG)}
          >
            {t('next', { ns: 'common' })}
          </Button>
        </Flex>
      </Flex>
    </StepWrapper>
  );
}
