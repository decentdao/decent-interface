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
import useDefaultNonce from '../../../hooks/DAO/useDefaultNonce';
import { useFractal } from '../../../providers/App/AppProvider';
import {
  ICreationStepProps,
  BigNumberValuePair,
  StrategyType,
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
    governanceContracts: { usulContract },
  } = useFractal();
  const { type } = governance;
  const [showCustomNonce, setShowCustomNonce] = useState(false);
  const [totalParentVotes, setTotalParentVotes] = useState(BigNumber.from(0));
  const { t } = useTranslation(['daoCreate', 'common', 'proposal']);
  const minutes = t('minutes', { ns: 'common' });
  const azoriusGovernance = governance as AzoriusGovernance;
  const governanceFormType = values.essentials.governance;
  const defaultNonce = useDefaultNonce();
  const handleNonceChange = useCallback(
    (nonce?: number) => {
      setFieldValue('gnosis.customNonce', nonce ? parseInt(nonce.toString(), 10) : undefined);
    },
    [setFieldValue]
  );

  useEffect(() => {
    const isParentUsul = type === StrategyType.GNOSIS_SAFE_USUL;
    if (!isParentUsul && isSubDAO) {
      setFieldValue('gnosis.customNonce', defaultNonce);
      setShowCustomNonce(true);
    }
  }, [isSubDAO, usulContract, type, setFieldValue, defaultNonce]);

  useEffect(() => {
    if (totalParentVotes.eq(0)) {
      if (!type || !safe || !azoriusGovernance.votesToken) return;

      let totalVotes: BigNumberValuePair;
      switch (type) {
        case StrategyType.GNOSIS_SAFE_USUL:
          const normalized = ethers.utils.formatUnits(
            azoriusGovernance.votesToken.totalSupply || '0',
            azoriusGovernance.votesToken.decimals
          );
          // ethers.utils.formatUnits returns a whole number string in the form `xxx.0`
          // but BigNumber won't parse out the insignificant decimal, so we need to cut it
          totalVotes = {
            value: safe.owners?.length.toString() || '',
            bigNumberValue: BigNumber.from(normalized.substring(0, normalized.indexOf('.'))),
          };
          break;
        case StrategyType.GNOSIS_SAFE:
        default:
          totalVotes = {
            value: safe.owners?.length.toString() || '',
            bigNumberValue: BigNumber.from(safe.owners?.length || 0),
          };
      }
      setTotalParentVotes(totalVotes.bigNumberValue!);

      const childThresholds = totalVotes.bigNumberValue!.eq(1)
        ? totalVotes
        : {
            value: ethers.utils.formatUnits(
              totalVotes.bigNumberValue!.div(2),
              azoriusGovernance.votesToken.decimals
            ),
            bigNumberValue: totalVotes.bigNumberValue!.div(2),
          };
      setFieldValue('vetoGuard.vetoVotesThreshold', childThresholds);
      setFieldValue('vetoGuard.freezeVotesThreshold', childThresholds);
    }
  }, [azoriusGovernance.votesToken, safe, totalParentVotes, type, setFieldValue]);

  const showVetoFreezeHelpers = totalParentVotes.gt(0);
  const formattedVotesTotal = formatBigNumberDisplay(totalParentVotes);

  const freezeHelper = showVetoFreezeHelpers
    ? t('helperFreezeVotesThreshold', { totalVotes: formattedVotesTotal })
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
        {governanceFormType === StrategyType.GNOSIS_SAFE && (
          <LabelComponent
            label={t('labelTimelockPeriod')}
            helper={t('helperTimelockPeriod')}
            isRequired
          >
            <InputGroup>
              <BigNumberInput
                value={values.vetoGuard.timelockPeriod.bigNumberValue}
                onChange={valuePair => setFieldValue('vetoGuard.timelockPeriod', valuePair)}
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
              value={values.vetoGuard.executionPeriod.bigNumberValue}
              onChange={valuePair => setFieldValue('vetoGuard.executionPeriod', valuePair)}
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
            value={values.vetoGuard.freezeVotesThreshold.bigNumberValue}
            onChange={valuePair => setFieldValue('vetoGuard.freezeVotesThreshold', valuePair)}
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
              value={values.vetoGuard.freezeProposalPeriod.bigNumberValue}
              onChange={valuePair => setFieldValue('vetoGuard.freezeProposalPeriod', valuePair)}
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
              value={values.vetoGuard.freezePeriod.bigNumberValue}
              onChange={valuePair => setFieldValue('vetoGuard.freezePeriod', valuePair)}
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
              {t('vetoGuardDescription')}
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
              nonce={values.gnosis.customNonce}
              onChange={handleNonceChange}
              defaultNonce={defaultNonce}
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
            governanceFormType === StrategyType.GNOSIS_SAFE
              ? CreatorSteps.GNOSIS_GOVERNANCE
              : CreatorSteps.GOV_CONFIG
          }
          isLastStep
        />
      </Flex>
    </StepWrapper>
  );
}

export default GuardDetails;
