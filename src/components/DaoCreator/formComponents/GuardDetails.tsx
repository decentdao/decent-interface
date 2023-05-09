import {
  Text,
  InputGroup,
  InputRightElement,
  Flex,
  Alert,
  AlertTitle,
  Divider,
} from '@chakra-ui/react';
import { Info } from '@decent-org/fractal-ui';
import { BigNumber, ethers } from 'ethers';
import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useFractal } from '../../../providers/App/AppProvider';
import {
  ICreationStepProps,
  BigNumberValuePair,
  GovernanceModuleType,
  CreatorSteps,
  AzoriusGovernance,
} from '../../../types';
import { formatBigNumberDisplay } from '../../../utils/numberFormats';
import ContentBoxTitle from '../../ui/containers/ContentBox/ContentBoxTitle';
import { BigNumberInput } from '../../ui/forms/BigNumberInput';
import { CustomNonceInput } from '../../ui/forms/CustomNonceInput';
import { LabelComponent } from '../../ui/forms/InputComponent';
import { StepButtons } from '../StepButtons';
import { StepWrapper } from '../StepWrapper';

function GuardDetails(props: ICreationStepProps) {
  const { values, isSubmitting, transactionPending, isSubDAO, setFieldValue } = props;
  const {
    node: { safe },
    governance,
    governanceContracts: { azoriusContract },
  } = useFractal();
  const { type } = governance;
  const [showCustomNonce, setShowCustomNonce] = useState(false);
  const [totalParentVotes, setTotalParentVotes] = useState<BigNumber>();
  const { t } = useTranslation(['daoCreate', 'common', 'proposal']);
  const minutes = t('minutes', { ns: 'common' });
  const azoriusGovernance = governance as AzoriusGovernance;
  const governanceFormType = values.essentials.governance;
  const handleNonceChange = useCallback(
    (nonce?: number) => {
      setFieldValue('gnosis.customNonce', nonce ? parseInt(nonce.toString(), 10) : undefined);
    },
    [setFieldValue]
  );

  useEffect(() => {
    const isParentAzorius = type === GovernanceModuleType.AZORIUS;
    if (!isParentAzorius && isSubDAO && safe) {
      setFieldValue('gnosis.customNonce', safe.nonce);
      setShowCustomNonce(true);
    }
  }, [isSubDAO, azoriusContract, type, setFieldValue, safe]);

  useEffect(() => {
    // set the initial value for freezeGuard.freezeVotesThreshold
    // and display helperFreezeVotesThreshold
    if (!totalParentVotes) {
      if (!type) return;

      let parentVotes: BigNumber;

      switch (type) {
        case GovernanceModuleType.AZORIUS:
          if (!azoriusGovernance || !azoriusGovernance.votesToken) return;
          const normalized = ethers.utils.formatUnits(
            azoriusGovernance.votesToken.totalSupply,
            azoriusGovernance.votesToken.decimals
          );
          parentVotes = BigNumber.from(normalized.substring(0, normalized.indexOf('.')));
          break;
        case GovernanceModuleType.MULTISIG:
        default:
          if (!safe) return;
          parentVotes = BigNumber.from(safe.owners.length);
      }

      let thresholdDefault: BigNumberValuePair;

      if (parentVotes.eq(1)) {
        thresholdDefault = {
          value: '1',
          bigNumberValue: parentVotes,
        };
      } else {
        thresholdDefault = {
          value: parentVotes.toString(),
          bigNumberValue: parentVotes.div(2),
        };
      }

      setTotalParentVotes(parentVotes);
      setFieldValue('freezeGuard.freezeVotesThreshold', thresholdDefault);
    }
  }, [
    azoriusGovernance.votesToken,
    safe,
    totalParentVotes,
    type,
    setFieldValue,
    azoriusGovernance,
  ]);

  const freezeHelper = totalParentVotes
    ? t('helperFreezeVotesThreshold', { totalVotes: formatBigNumberDisplay(totalParentVotes) })
    : null;

  return (
    <StepWrapper
      isSubDAO={isSubDAO}
      isFormSubmitting={!!isSubmitting || transactionPending}
      titleKey="titleGuardConfig"
    >
      <Flex
        flexDirection="column"
        gap={8}
      >
        <ContentBoxTitle>{t('titleParentGovernance')}</ContentBoxTitle>
        {governanceFormType === GovernanceModuleType.MULTISIG && (
          <LabelComponent
            label={t('labelTimelockPeriod')}
            helper={t('helperTimelockPeriod')}
            isRequired
          >
            <InputGroup>
              <BigNumberInput
                value={values.freeze.timelockPeriod.bigNumberValue}
                onChange={valuePair => setFieldValue('freezeGuard.timelockPeriod', valuePair)}
                decimalPlaces={0}
                min="1"
                data-testid="guardConfig-executionDetails"
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
        )}
        <LabelComponent
          label={t('labelExecutionPeriod')}
          helper={t('helperExecutionPeriod')}
          isRequired
        >
          <InputGroup>
            <BigNumberInput
              value={values.freeze.executionPeriod.bigNumberValue}
              onChange={valuePair => setFieldValue('freezeGuard.executionPeriod', valuePair)}
              decimalPlaces={0}
              min="1"
              data-testid="guardConfig-executionDetails"
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

        <ContentBoxTitle>{t('titleFreezeParams')}</ContentBoxTitle>
        <LabelComponent
          label={t('labelFreezeVotesThreshold')}
          helper={freezeHelper || ''}
          isRequired
        >
          <BigNumberInput
            value={values.freeze.freezeVotesThreshold.bigNumberValue}
            onChange={valuePair => setFieldValue('freezeGuard.freezeVotesThreshold', valuePair)}
            decimalPlaces={0}
            data-testid="guardConfig-freezeVotesThreshold"
          />
        </LabelComponent>
        <LabelComponent
          label={t('labelFreezeProposalPeriod')}
          helper={t('helperFreezeProposalPeriod')}
          isRequired
        >
          <InputGroup>
            <BigNumberInput
              value={values.freeze.freezeProposalPeriod.bigNumberValue}
              onChange={valuePair => setFieldValue('freezeGuard.freezeProposalPeriod', valuePair)}
              decimalPlaces={0}
              min="1"
              data-testid="guardConfig-freezeProposalDuration"
            />
            <InputRightElement mr="4">{minutes}</InputRightElement>
          </InputGroup>
          <Text
            textStyle="text-md-sans-regular"
            color="grayscale.500"
            mt={2}
          >
            {t('exampleFreezeProposalPeriod')}
          </Text>
        </LabelComponent>
        <LabelComponent
          label={t('labelFreezePeriod')}
          helper={t('helperFreezePeriod')}
          isRequired
        >
          <InputGroup>
            <BigNumberInput
              value={values.freeze.freezePeriod.bigNumberValue}
              onChange={valuePair => setFieldValue('freezeGuard.freezePeriod', valuePair)}
              decimalPlaces={0}
              min="1"
              data-testid="guardConfig-freezeDuration"
            />

            <InputRightElement mr="4">{minutes}</InputRightElement>
          </InputGroup>
          <Text
            textStyle="text-md-sans-regular"
            color="grayscale.500"
            mt={2}
          >
            {t('exampleFreezePeriod')}
          </Text>
        </LabelComponent>
        <Alert status="info">
          <Info boxSize="24px" />
          <AlertTitle>
            <Text
              textStyle="text-lg-mono-medium"
              whiteSpace="pre-wrap"
            >
              {t('freezeGuardDescription')}
            </Text>
          </AlertTitle>
        </Alert>
        <Divider
          color="chocolate.700"
          mb={4}
        />
        {showCustomNonce && (
          <>
            <CustomNonceInput
              nonce={values.multisig.customNonce}
              onChange={handleNonceChange}
            />
            <Divider
              color="chocolate.700"
              my={4}
            />
          </>
        )}
        <StepButtons
          {...props}
          prevStep={
            governanceFormType === GovernanceModuleType.MULTISIG
              ? CreatorSteps.MULTISIG_DETAILS
              : CreatorSteps.AZORIUS_DETAILS
          }
          isLastStep
        />
      </Flex>
    </StepWrapper>
  );
}

export default GuardDetails;
