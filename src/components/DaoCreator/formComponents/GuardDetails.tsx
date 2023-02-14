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
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFractal } from '../../../providers/Fractal/hooks/useFractal';
import { GovernanceTypes } from '../../../providers/Fractal/types';
import { formatBigNumberDisplay } from '../../../utils/numberFormats';
import { LabelComponent } from '../../ProposalCreate/InputComponent';
import ContentBoxTitle from '../../ui/containers/ContentBox/ContentBoxTitle';
import { BigNumberInput, BigNumberValuePair } from '../../ui/forms/BigNumberInput';
import { StepButtons } from '../StepButtons';
import { StepWrapper } from '../StepWrapper';
import { CreatorSteps, ICreationStepProps } from '../types';

function GuardDetails(props: ICreationStepProps) {
  const {
    gnosis: { safe },
    governance: { type, governanceToken, governanceIsLoading },
  } = useFractal();
  const { values, setFieldValue } = props;
  const [totalParentVotes, setTotalParentVotes] = useState(BigNumber.from(0));

  const { t } = useTranslation(['daoCreate', 'common', 'proposal']);
  const minutes = t('minutes', { ns: 'common' });
  const governance = values.essentials.governance;
  useEffect(() => {
    if (totalParentVotes.eq(0)) {
      if (governanceIsLoading || !safe || !governanceToken) return;

      let totalVotes: BigNumberValuePair;
      switch (type) {
        case GovernanceTypes.GNOSIS_SAFE_USUL:
          const normalized = ethers.utils.formatUnits(
            governanceToken.totalSupply || '0',
            governanceToken.decimals
          );
          // ethers.utils.formatUnits returns a whole number string in the form `xxx.0`
          // but BigNumber won't parse out the insignificant decimal, so we need to cut it
          totalVotes = {
            value: safe.owners?.length.toString() || '',
            bigNumberValue: BigNumber.from(normalized.substring(0, normalized.indexOf('.'))),
          };
          break;
        case GovernanceTypes.GNOSIS_SAFE:
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
              governanceToken.decimals
            ),
            bigNumberValue: totalVotes.bigNumberValue!.div(2),
          };
      setFieldValue('vetoGuard.vetoVotesThreshold', childThresholds);
      setFieldValue('vetoGuard.freezeVotesThreshold', childThresholds);
    }
  }, [
    governanceIsLoading,
    governanceToken,
    safe,
    safe.threshold,
    totalParentVotes,
    type,
    setFieldValue,
  ]);

  const showVetoFreezeHelpers = totalParentVotes.gt(0);
  const formattedVotesTotal = formatBigNumberDisplay(totalParentVotes);

  const freezeHelper = showVetoFreezeHelpers
    ? t('helperFreezeVotesThreshold', { totalVotes: formattedVotesTotal })
    : null;

  return (
    <StepWrapper titleKey="titleGuardConfig">
      <Flex
        flexDirection="column"
        gap={8}
      >
        <ContentBoxTitle>{t('titleParentGovernance')}</ContentBoxTitle>
        {governance === GovernanceTypes.GNOSIS_SAFE && (
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
        <Divider color="chocolate.700" />
        <StepButtons
          {...props}
          prevStep={
            governance === GovernanceTypes.GNOSIS_SAFE
              ? CreatorSteps.GOV_CONFIG
              : CreatorSteps.GNOSIS_GOVERNANCE
          }
          isLastStep
        />
      </Flex>
    </StepWrapper>
  );
}

export default GuardDetails;
