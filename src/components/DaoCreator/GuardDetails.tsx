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
import { formatBigNumberDisplay } from '../../utils/numberFormats';
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
  const [totalParentVotes, setTotalParentVotes] = useState(BigNumber.from(0));

  const fieldUpdate = (key: string, value: BigNumber) => {
    dispatch({
      type: CreatorProviderActions.UPDATE_GUARD_CONFIG,
      payload: {
        [key]: value,
      },
    });
  };
  const onExecutionPeriodChange = (executionPeriod: string) => {
    const newExecutionPeriod = BigNumber.from(executionPeriod || 0);
    fieldUpdate('executionPeriod', newExecutionPeriod);
  };
  const onTimelockPeriodChange = (timelockPeriod: string) => {
    const newTimelockPeriod = BigNumber.from(timelockPeriod || 0);
    fieldUpdate('timelockPeriod', newTimelockPeriod);
  };
  const onVetoVotesThresholdChange = (vetoVotesThreshold: string) => {
    const newVetoVotesThreshold = BigNumber.from(vetoVotesThreshold || 0);
    fieldUpdate('vetoVotesThreshold', newVetoVotesThreshold);
  };
  const onFreezeVotesThresholdChange = (freezeVotesThreshold: string) => {
    const newFreezeVotesThreshold = BigNumber.from(freezeVotesThreshold || 0);
    fieldUpdate('freezeVotesThreshold', newFreezeVotesThreshold);
  };

  const onFreezeProposalPeriodChange = (freezeProposalPeriod: string) => {
    const newFreezePeriod = BigNumber.from(freezeProposalPeriod || 0);
    fieldUpdate('freezeProposalPeriod', newFreezePeriod);
  };

  const onFreezePeriodChange = (freezePeriod: string) => {
    const newFreezePeriod = BigNumber.from(freezePeriod || 0);
    fieldUpdate('freezePeriod', newFreezePeriod);
  };

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
      dispatch({
        type: CreatorProviderActions.UPDATE_GUARD_CONFIG,
        payload: {
          ['vetoVotesThreshold']: childThresholds,
          ['freezeVotesThreshold']: childThresholds,
        },
      });
    }
  }, [
    dispatch,
    governance,
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
                  <InputRightElement mr="4">{minutes}</InputRightElement>
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
                <InputRightElement mr="4">{minutes}</InputRightElement>
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
                <InputRightElement mr="4">{minutes}</InputRightElement>
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
                <InputRightElement mr="4">{minutes}</InputRightElement>
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
