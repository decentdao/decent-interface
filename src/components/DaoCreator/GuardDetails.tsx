import { Box, Text, InputGroup, InputRightElement, Hide } from '@chakra-ui/react';
import { LabelWrapper } from '@decent-org/fractal-ui';
import { BigNumber, ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFractal } from '../../providers/Fractal/hooks/useFractal';
import { GovernanceTypes } from '../../providers/Fractal/types';
import { formatBigNumberDisplay } from '../../utils/numberFormats';
import { BigNumberInput } from '../ui/BigNumberInput';
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

  const [totalParentVotes, setTotalParentVotes] = useState(BigNumber.from(0));

  const fieldUpdate = (key: string, value: BigNumber) => {
    dispatch({
      type: CreatorProviderActions.UPDATE_GUARD_CONFIG,
      payload: {
        [key]: value,
      },
    });
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
              <InputGroup>
                <BigNumberInput
                  value={vetoGuard.timelockPeriod}
                  onChange={value => fieldUpdate('timelockPeriod', value.bigNumberValue)}
                  decimalPlaces={0}
                  min="1"
                  data-testid="guardConfig-executionDetails"
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
        )}
        <InputBox>
          <LabelWrapper
            label={t('labelExecutionPeriod')}
            subLabel={t('helperExecutionPeriod')}
          >
            <InputGroup>
              <BigNumberInput
                value={vetoGuard.executionPeriod}
                onChange={value => fieldUpdate('executionPeriod', value.bigNumberValue)}
                decimalPlaces={0}
                min="1"
                data-testid="guardConfig-executionDetails"
              />
              <InputRightElement mr="4">{minutes}</InputRightElement>
            </InputGroup>
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
              <InputGroup>
                <BigNumberInput
                  value={vetoGuard.vetoVotesThreshold}
                  onChange={value => fieldUpdate('vetoVotesThreshold', value.bigNumberValue)}
                  decimalPlaces={0}
                  min="1"
                  data-testid="guardConfig-vetoVotesThreshold"
                />
                <InputRightElement mr="4">{votes}</InputRightElement>
              </InputGroup>
            </LabelWrapper>
          </InputBox>
        </Hide>
        <ContentBoxTitle>{t('titleFreezeParams')}</ContentBoxTitle>
        <InputBox>
          <LabelWrapper
            label={t('labelFreezeVotesThreshold')}
            subLabel={freezeHelper}
          >
            <BigNumberInput
              value={vetoGuard.freezeVotesThreshold}
              onChange={value => fieldUpdate('freezeVotesThreshold', value.bigNumberValue)}
              decimalPlaces={0}
              data-testid="guardConfig-freezeVotesThreshold"
            />
          </LabelWrapper>
        </InputBox>
        <InputBox>
          <LabelWrapper
            label={t('labelFreezeProposalPeriod')}
            subLabel={t('helperFreezeProposalPeriod')}
          >
            <InputGroup>
              <BigNumberInput
                value={vetoGuard.freezeProposalPeriod}
                onChange={value => fieldUpdate('freezeProposalPeriod', value.bigNumberValue)}
                decimalPlaces={0}
                min="1"
                data-testid="guardConfig-freezeProposalDuration"
              />
              <InputRightElement mr="4">{minutes}</InputRightElement>
            </InputGroup>
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
            <InputGroup>
              <BigNumberInput
                value={vetoGuard.freezePeriod}
                onChange={value => fieldUpdate('freezePeriod', value.bigNumberValue)}
                decimalPlaces={0}
                min="1"
                data-testid="guardConfig-freezeDuration"
              />

              <InputRightElement mr="4">{minutes}</InputRightElement>
            </InputGroup>
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
