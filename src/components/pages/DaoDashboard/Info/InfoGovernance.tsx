import { Box, Flex, Text } from '@chakra-ui/react';
import { Govern } from '@decent-org/fractal-ui';
import { MultisigFreezeGuard } from '@fractal-framework/fractal-contracts';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useProvider } from 'wagmi';
import { useTimeHelpers } from '../../../../hooks/utils/useTimeHelpers';
import { useFractal } from '../../../../providers/App/AppProvider';
import { AzoriusGovernance, FreezeGuardType } from '../../../../types';
import { blocksToSeconds } from '../../../../utils/contract';
import { BarLoader } from '../../../ui/loaders/BarLoader';

export function InfoGovernance() {
  const { t } = useTranslation(['dashboard', 'daoCreate', 'common']);
  const {
    node: { daoAddress },
    governance,
    guardContracts: { freezeGuardType, freezeGuardContract },
    readOnly: { dao },
  } = useFractal();
  const provider = useProvider();
  const { getTimeDuration } = useTimeHelpers();

  const [timelockPeriod, setTimelockPeriod] = useState<string>();
  const [executionPeriod, setExecutionPeriod] = useState<string>();
  useEffect(() => {
    const setTimelockInfo = async () => {
      if (!timelockPeriod && !executionPeriod) {
        const formatBlocks = async (blocks: number): Promise<string | undefined> => {
          return getTimeDuration(await blocksToSeconds(blocks, provider));
        };
        if (freezeGuardType == FreezeGuardType.MULTISIG) {
          if (freezeGuardContract) {
            const freezeGuard = freezeGuardContract.asSigner as MultisigFreezeGuard;
            setTimelockPeriod(await formatBlocks(await freezeGuard.timelockPeriod()));
            setExecutionPeriod(await formatBlocks(await freezeGuard.executionPeriod()));
          }
        } else if (dao?.isAzorius) {
          const azoriusGovernance = governance as AzoriusGovernance;
          const timelock = azoriusGovernance.votingStrategy?.timeLockPeriod;
          if (timelock?.formatted) {
            setTimelockPeriod(timelock.formatted);
          }
          // TODO Azorius execution period
          // We don't have room to fit a 5th row on this card currently,
          // so leaving this off until we can have a discussion with design
          // setExecutionPeriod(await freezeGuard.executionPeriod());
        }
      }
    };

    setTimelockInfo();
  }, [
    executionPeriod,
    getTimeDuration,
    governance,
    freezeGuardContract,
    freezeGuardType,
    provider,
    timelockPeriod,
    dao,
  ]);

  if (!daoAddress || !governance.type) {
    return (
      <Flex
        h="8.5rem"
        width="100%"
        alignItems="center"
        justifyContent="center"
      >
        <BarLoader />
      </Flex>
    );
  }

  const governanceAzorius = dao?.isAzorius ? (governance as AzoriusGovernance) : undefined;

  return (
    <Box
      data-testid="dashboard-daoGovernance"
      textStyle="text-sm-sans-regular"
    >
      <Flex
        alignItems="center"
        gap="0.4rem"
        mb="0.5rem"
      >
        <Govern />
        <Text
          textStyle="text-sm-sans-regular"
          color="grayscale.100"
        >
          {t('titleGovernance')}
        </Text>
      </Flex>

      <Flex
        alignItems="center"
        justifyContent="space-between"
        mb="0.25rem"
      >
        <Text
          textStyle="text-base-sans-regular"
          color="chocolate.200"
        >
          {t('titleType')}
        </Text>
        <Text
          textStyle="text-base-sans-regular"
          color="grayscale.100"
        >
          {governance.type ? t(governance.type.toString(), { ns: 'daoCreate' }) : ''}
        </Text>
      </Flex>

      {governanceAzorius?.votingStrategy?.votingPeriod && (
        <Flex
          alignItems="center"
          justifyContent="space-between"
          mb="0.25rem"
        >
          <Text
            textStyle="text-base-sans-regular"
            color="chocolate.200"
          >
            {t('titleVotingPeriod')}
          </Text>
          <Text
            textStyle="text-base-sans-regular"
            color="grayscale.100"
          >
            {governanceAzorius.votingStrategy?.votingPeriod?.formatted}
          </Text>
        </Flex>
      )}
      {governanceAzorius?.votingStrategy?.quorumPercentage && (
        <Flex
          alignItems="center"
          justifyContent="space-between"
          mb="0.25rem"
        >
          <Text
            textStyle="text-base-sans-regular"
            color="chocolate.200"
          >
            {t('titleQuorum')}
          </Text>
          <Text
            textStyle="text-base-sans-regular"
            color="grayscale.100"
          >
            {governanceAzorius.votingStrategy.quorumPercentage.formatted}
          </Text>
        </Flex>
      )}
      {governanceAzorius?.votingStrategy?.quorumThreshold && (
        <Flex
          alignItems="center"
          justifyContent="space-between"
          mb="0.25rem"
        >
          <Text
            textStyle="text-base-sans-regular"
            color="chocolate.200"
          >
            {t('titleQuorum')}
          </Text>
          <Text
            textStyle="text-base-sans-regular"
            color="grayscale.100"
          >
            {governanceAzorius.votingStrategy.quorumThreshold.formatted}
          </Text>
        </Flex>
      )}
      {timelockPeriod && (
        <Flex
          alignItems="center"
          justifyContent="space-between"
          mb="0.25rem"
        >
          <Text
            textStyle="text-base-sans-regular"
            color="chocolate.200"
          >
            {t('timelock', { ns: 'common' })}
          </Text>
          <Text
            textStyle="text-base-sans-regular"
            color="grayscale.100"
          >
            {timelockPeriod}
          </Text>
        </Flex>
      )}
      {executionPeriod && (
        <Flex
          alignItems="center"
          justifyContent="space-between"
          mb="0.25rem"
        >
          <Text
            textStyle="text-base-sans-regular"
            color="chocolate.200"
          >
            {t('execution', { ns: 'common' })}
          </Text>
          <Text
            textStyle="text-base-sans-regular"
            color="grayscale.100"
          >
            {executionPeriod}
          </Text>
        </Flex>
      )}
    </Box>
  );
}
