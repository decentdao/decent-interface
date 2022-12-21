import {
  Box,
  Text,
  NumberInput,
  NumberInputField,
  InputGroup,
  InputRightElement,
  Hide,
  Input,
} from '@chakra-ui/react';
import { LabelWrapper } from '@decent-org/fractal-ui';
import { BigNumber, ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormHelpers } from '../../hooks/utils/useFormHelpers';
import { useFractal } from '../../providers/Fractal/hooks/useFractal';
import { GovernanceTypes } from '../../providers/Fractal/types';
import ContentBanner from '../ui/ContentBanner';
import ContentBox from '../ui/ContentBox';
import ContentBoxTitle from '../ui/ContentBoxTitle';
import InputBox from '../ui/forms/InputBox';
import { useCreator } from './provider/hooks/useCreator';
import { CreatorProviderActions } from './provider/types';

function GuardDetails() {
  const {
    state: { vetoGuard, governance },
    dispatch,
  } = useCreator();
  const {
    gnosis: { safe },
    governance: { type, governanceToken, governanceIsLoading },
  } = useFractal();

  const { restrictChars } = useFormHelpers();
  const [totalParentVotes, setTotalParentVotes] = useState(0);

  const fieldUpdate = (value: any, field: string) => {
    dispatch({
      type: CreatorProviderActions.UPDATE_GUARD_CONFIG,
      payload: {
        [field]: value,
      },
    });
  };
  const onExecutionPeriodChange = (executionPeriod: string) => {
    const newExecutionPeriod = BigNumber.from(executionPeriod || 0);
    fieldUpdate(newExecutionPeriod, 'executionPeriod');
  };
  const onTimelockPeriodChange = (timelockPeriod: string) => {
    const newTimelockPeriod = BigNumber.from(timelockPeriod || 0);
    fieldUpdate(newTimelockPeriod, 'timelockPeriod');
  };
  const onVetoVotesThresholdChange = (vetoVotesThreshold: string) => {
    const newVetoVotesThreshold = BigNumber.from(vetoVotesThreshold || 0);
    fieldUpdate(newVetoVotesThreshold, 'vetoVotesThreshold');
  };
  const onFreezeVotesThresholdChange = (freezeVotesThreshold: string) => {
    const newFreezeVotesThreshold = BigNumber.from(freezeVotesThreshold || 0);
    fieldUpdate(newFreezeVotesThreshold, 'freezeVotesThreshold');
  };

  const onFreezeProposalPeriodChange = (freezeProposalPeriod: string) => {
    const newFreezePeriod = BigNumber.from(freezeProposalPeriod || 0);
    fieldUpdate(newFreezePeriod, 'freezeProposalPeriod');
  };

  const onFreezePeriodChange = (freezePeriod: string) => {
    const newFreezePeriod = BigNumber.from(freezePeriod || 0);
    fieldUpdate(newFreezePeriod, 'freezePeriod');
  };

  const { t } = useTranslation(['daoCreate', 'common', 'proposal']);
  const votes = t('votesTitle', { ns: 'proposal' });
  const seconds = t('seconds', { ns: 'common' });

  useEffect(() => {
    if (totalParentVotes === 0) {
      if (governanceIsLoading || !safe || !governanceToken) return;

      let totalVotes: number;
      switch (type) {
        case GovernanceTypes.GNOSIS_SAFE_USUL:
          totalVotes = parseInt(
            ethers.utils.formatUnits(governanceToken.totalSupply || '0', governanceToken.decimals)
          );
          break;
        case GovernanceTypes.GNOSIS_SAFE:
        default:
          totalVotes = safe.owners?.length || 0;
      }
      setTotalParentVotes(totalVotes);

      const childThresholds = Math.ceil(totalVotes / 2);
      fieldUpdate(childThresholds, 'vetoVotesThreshold');
      fieldUpdate(childThresholds, 'freezeVotesThreshold');
    }
  }, [
    dispatch,
    fieldUpdate,
    governance,
    governanceIsLoading,
    governanceToken,
    safe,
    safe.threshold,
    totalParentVotes,
    type,
  ]);

  const showVetoFreezeHelpers = totalParentVotes > 0;
  const formattedVotesTotal = totalParentVotes.toLocaleString();
  const vetoHelper = showVetoFreezeHelpers
    ? t('helperVetoVotesThreshold', { totalVotes: formattedVotesTotal })
    : null;
  const freezeHelper = showVetoFreezeHelpers
    ? t('helperFreezeVotesThreshold', { totalVotes: formattedVotesTotal })
    : null;

  return (
    <Box>
      <ContentBox>
        <ContentBoxTitle>{t('titleParentGovernance')}</ContentBoxTitle>
        {governance === GovernanceTypes.GNOSIS_SAFE && (
          <InputBox>
            <LabelWrapper
              label={t('labelTimelockPeriod')}
              subLabel={t('helperTimelockPeriod')}
            >
              <NumberInput
                value={vetoGuard.timelockPeriod.toString()}
                onChange={onTimelockPeriodChange}
                min={1}
                precision={0}
                data-testid="guardConfig-executionDetails"
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
        )}
        <InputBox>
          <LabelWrapper
            label={t('labelExecutionPeriod')}
            subLabel={t('helperExecutionPeriod')}
          >
            <NumberInput
              value={vetoGuard.executionPeriod.toString()}
              onChange={onExecutionPeriodChange}
              min={1}
              precision={0}
              data-testid="guardConfig-executionDetails"
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
            {t('exampleExecutionPeriod')}
          </Text>
        </InputBox>
        {/** TODO hiding Veto Threshold for now, since it's not implemented in the frontend */}
        <Hide>
          <InputBox>
            <LabelWrapper
              label={t('labelVetoVotesThreshold')}
              subLabel={vetoHelper}
            >
              <NumberInput
                value={vetoGuard.vetoVotesThreshold.toString()}
                onChange={onVetoVotesThresholdChange}
                min={1}
                precision={0}
                data-testid="guardConfig-vetoVotesThreshold"
                onKeyDown={restrictChars}
              >
                <InputGroup>
                  <NumberInputField />
                  <InputRightElement mr="4">{votes}</InputRightElement>
                </InputGroup>
              </NumberInput>
            </LabelWrapper>
          </InputBox>
        </Hide>
        <ContentBoxTitle>{t('titleFreezeParams')}</ContentBoxTitle>
        <InputBox>
          <LabelWrapper
            label={t('labelFreezeVotesThreshold')}
            subLabel={freezeHelper}
          >
            <Input
              value={vetoGuard.freezeVotesThreshold.toString()}
              onChange={e => onFreezeVotesThresholdChange(e.target.value)}
              onKeyDown={restrictChars}
            />
          </LabelWrapper>
        </InputBox>
        <InputBox>
          <LabelWrapper
            label={t('labelFreezeProposalPeriod')}
            subLabel={t('helperFreezeProposalPeriod')}
          >
            <NumberInput
              value={vetoGuard.freezeProposalPeriod.toString()}
              onChange={onFreezeProposalPeriodChange}
              min={1}
              precision={0}
              data-testid="guardConfig-freezeProposalDuration"
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
            {t('exampleFreezeProposalPeriod')}
          </Text>
        </InputBox>
        <InputBox>
          <LabelWrapper
            label={t('labelFreezePeriod')}
            subLabel={t('helperFreezePeriod')}
          >
            <NumberInput
              value={vetoGuard.freezePeriod.toString()}
              onChange={onFreezePeriodChange}
              min={1}
              precision={0}
              data-testid="guardConfig-freezeDuration"
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
            {t('exampleFreezePeriod')}
          </Text>
        </InputBox>
      </ContentBox>
      <ContentBanner description={t('vetoGuardDescription')} />
    </Box>
  );
}

export default GuardDetails;
