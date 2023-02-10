import { Text, InputGroup, InputRightElement, Hide, Flex } from '@chakra-ui/react';
import { BigNumber, ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFractal } from '../../providers/Fractal/hooks/useFractal';
import { GovernanceTypes } from '../../providers/Fractal/types';
import { formatBigNumberDisplay } from '../../utils/numberFormats';
import { LabelComponent } from '../ProposalCreate/InputComponent';
import ContentBanner from '../ui/containers/ContentBanner';
import ContentBoxTitle from '../ui/containers/ContentBox/ContentBoxTitle';
import { StepWrapper } from './StepWrapper';
import { BigNumberInput } from './refactor/BigNumberInput';
import { ICreationStepProps } from './types';

function GuardDetails({ values, setFieldValue }: ICreationStepProps) {
  const {
    gnosis: { safe },
    governance: { type, governanceToken, governanceIsLoading },
  } = useFractal();

  const [totalParentVotes, setTotalParentVotes] = useState(BigNumber.from(0));

  const { t } = useTranslation(['daoCreate', 'common', 'proposal']);
  const votes = t('votesTitle', { ns: 'proposal' });
  const minutes = t('minutes', { ns: 'common' });

  useEffect(() => {
    if (totalParentVotes.eq(0)) {
      if (governanceIsLoading || !safe || !governanceToken) return;

      let totalVotes: BigNumber;
      switch (type) {
        case GovernanceTypes.GNOSIS_SAFE_USUL:
          const normalized = ethers.utils.formatUnits(
            governanceToken.totalSupply || '0',
            governanceToken.decimals
          );
          // ethers.utils.formatUnits returns a whole number string in the form `xxx.0`
          // but BigNumber won't parse out the insignificant decimal, so we need to cut it
          totalVotes = BigNumber.from(normalized.substring(0, normalized.indexOf('.')));
          break;
        case GovernanceTypes.GNOSIS_SAFE:
        default:
          totalVotes = BigNumber.from(safe.owners?.length || 0);
      }
      setTotalParentVotes(totalVotes);

      const childThresholds = totalVotes.eq(1) ? totalVotes : totalVotes.div(2);
      console.log('🚀 ~ file: GuardDetails.tsx:49 ~ childThresholds', childThresholds);
      // dispatch({
      //   type: CreatorProviderActions.UPDATE_GUARD_CONFIG,
      //   payload: {
      //     ['vetoVotesThreshold']: childThresholds,
      //     ['freezeVotesThreshold']: childThresholds,
      //   },
      // });
    }
  }, [
    // dispatch,
    // governance,
    governanceIsLoading,
    governanceToken,
    safe,
    safe.threshold,
    totalParentVotes,
    type,
  ]);

  const showVetoFreezeHelpers = totalParentVotes.gt(0);
  const formattedVotesTotal = formatBigNumberDisplay(totalParentVotes);
  const vetoHelper = showVetoFreezeHelpers
    ? t('helperVetoVotesThreshold', { totalVotes: formattedVotesTotal })
    : null;
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
        {values.essentials.governance === GovernanceTypes.GNOSIS_SAFE && (
          <LabelComponent
            label={t('labelTimelockPeriod')}
            helper={t('helperTimelockPeriod')}
            isRequired
          >
            <InputGroup>
              <BigNumberInput
                value={values.vetoGuard.timelockPeriod}
                onChange={value => setFieldValue('vetoGuard.timelockPeriod', value)}
                decimalPlaces={0}
                min="1"
                data-testid="guardConfig-executionDetails"
              />
              <InputRightElement mr="4">{minutes}</InputRightElement>
            </InputGroup>
            <Text
              textStyle="text-sm-sans-regular"
              color="gold.400"
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
              value={values.vetoGuard.executionPeriod}
              onChange={value => setFieldValue('vetoGuard.executionPeriod', value)}
              decimalPlaces={0}
              min="1"
              data-testid="guardConfig-executionDetails"
            />
            <InputRightElement mr="4">{minutes}</InputRightElement>
          </InputGroup>
          <Text
            textStyle="text-sm-sans-regular"
            color="gold.400"
          >
            {t('exampleExecutionPeriod')}
          </Text>
        </LabelComponent>
        {/** TODO hiding Veto Threshold for now, since it's not implemented in the frontend */}
        <Hide>
          <LabelComponent
            label={t('labelVetoVotesThreshold')}
            helper={vetoHelper || ''}
            isRequired={false}
          >
            <InputGroup>
              <BigNumberInput
                value={values.vetoGuard.vetoVotesThreshold}
                onChange={value => setFieldValue('vetoGuard.vetoVotesThreshold', value)}
                decimalPlaces={0}
                min="1"
                data-testid="guardConfig-vetoVotesThreshold"
              />
              <InputRightElement mr="4">{votes}</InputRightElement>
            </InputGroup>
          </LabelComponent>
        </Hide>
        <ContentBoxTitle>{t('titleFreezeParams')}</ContentBoxTitle>
        <LabelComponent
          label={t('labelFreezeVotesThreshold')}
          helper={freezeHelper || ''}
          isRequired
        >
          <BigNumberInput
            value={values.vetoGuard.freezeVotesThreshold}
            onChange={value => setFieldValue('vetoGuard.freezeVotesThreshold', value)}
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
              value={values.vetoGuard.freezeProposalPeriod}
              onChange={value => setFieldValue('vetoGuard.freezeProposalPeriod', value)}
              decimalPlaces={0}
              min="1"
              data-testid="guardConfig-freezeProposalDuration"
            />
            <InputRightElement mr="4">{minutes}</InputRightElement>
          </InputGroup>
          <Text
            textStyle="text-sm-sans-regular"
            color="gold.400"
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
              value={values.vetoGuard.freezePeriod}
              onChange={value => setFieldValue('vetoGuard.freezePeriod', value)}
              decimalPlaces={0}
              min="1"
              data-testid="guardConfig-freezeDuration"
            />

            <InputRightElement mr="4">{minutes}</InputRightElement>
          </InputGroup>
          <Text
            textStyle="text-sm-sans-regular"
            color="gold.400"
          >
            {t('exampleFreezePeriod')}
          </Text>
        </LabelComponent>
        <ContentBanner description={t('vetoGuardDescription')} />
      </Flex>
    </StepWrapper>
  );
}

export default GuardDetails;
