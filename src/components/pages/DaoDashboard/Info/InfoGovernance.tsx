import { Box, Flex, Text } from '@chakra-ui/react';
import { Bank } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSafeContracts from '../../../../hooks/safe/useSafeContracts';
import { useTimeHelpers } from '../../../../hooks/utils/useTimeHelpers';
import { useFractal } from '../../../../providers/App/AppProvider';
import { useEthersProvider } from '../../../../providers/Ethers/hooks/useEthersProvider';
import { AzoriusGovernance, FreezeGuardType } from '../../../../types';
import { blocksToSeconds } from '../../../../utils/contract';
import { BarLoader } from '../../../ui/loaders/BarLoader';

export function InfoGovernance() {
  const { t } = useTranslation(['dashboard', 'daoCreate', 'common']);
  const {
    node: { daoAddress },
    governance,
    guardContracts: { freezeGuardType, freezeGuardContractAddress },
    readOnly: { dao },
  } = useFractal();
  const provider = useEthersProvider();
  const { getTimeDuration } = useTimeHelpers();
  const baseContracts = useSafeContracts();
  const [timelockPeriod, setTimelockPeriod] = useState<string>();
  const [executionPeriod, setExecutionPeriod] = useState<string>();
  useEffect(() => {
    const setTimelockInfo = async () => {
      const formatBlocks = async (blocks: number): Promise<string | undefined> => {
        if (provider) {
          return getTimeDuration(await blocksToSeconds(blocks, provider));
        }
      };
      if (freezeGuardType == FreezeGuardType.MULTISIG) {
        if (freezeGuardContractAddress && baseContracts) {
          const freezeGuardContract =
            baseContracts.multisigFreezeGuardMasterCopyContract.asProvider.attach(
              freezeGuardContractAddress,
            );
          setTimelockPeriod(await formatBlocks(await freezeGuardContract.timelockPeriod()));
          setExecutionPeriod(await formatBlocks(await freezeGuardContract.executionPeriod()));
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
      return () => {
        setTimelockPeriod(undefined);
        setExecutionPeriod(undefined);
      };
    };

    setTimelockInfo();
  }, [
    baseContracts,
    executionPeriod,
    getTimeDuration,
    governance,
    freezeGuardContractAddress,
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
    <Box data-testid="dashboard-daoGovernance">
      <Flex
        alignItems="center"
        gap="0.4rem"
        mb="0.5rem"
      >
        <Bank size="1.5rem" />
        <Text textStyle="display-lg">{t('titleGovernance')}</Text>
      </Flex>

      <Flex
        alignItems="center"
        justifyContent="space-between"
        mb="0.25rem"
      >
        <Text color="neutral-7">{t('titleType')}</Text>
        <Text>{governance.type ? t(governance.type.toString(), { ns: 'daoCreate' }) : ''}</Text>
      </Flex>

      {governanceAzorius?.votingStrategy?.votingPeriod && (
        <Flex
          alignItems="center"
          justifyContent="space-between"
          mb="0.25rem"
        >
          <Text color="neutral-7">{t('titleVotingPeriod')}</Text>
          <Text>{governanceAzorius.votingStrategy?.votingPeriod?.formatted}</Text>
        </Flex>
      )}
      {governanceAzorius?.votingStrategy?.quorumPercentage && (
        <Flex
          alignItems="center"
          justifyContent="space-between"
          mb="0.25rem"
        >
          <Text color="neutral-7">{t('titleQuorum')}</Text>
          <Text>{governanceAzorius.votingStrategy.quorumPercentage.formatted}</Text>
        </Flex>
      )}
      {governanceAzorius?.votingStrategy?.quorumThreshold && (
        <Flex
          alignItems="center"
          justifyContent="space-between"
          mb="0.25rem"
        >
          <Text color="neutral-7">{t('titleQuorum')}</Text>
          <Text>{governanceAzorius.votingStrategy.quorumThreshold.formatted}</Text>
        </Flex>
      )}
      {timelockPeriod && (
        <Flex
          alignItems="center"
          justifyContent="space-between"
          mb="0.25rem"
        >
          <Text color="neutral-7">{t('timelock', { ns: 'common' })}</Text>
          <Text>{timelockPeriod}</Text>
        </Flex>
      )}
      {executionPeriod && (
        <Flex
          alignItems="center"
          justifyContent="space-between"
          mb="0.25rem"
        >
          <Text color="neutral-7">{t('execution', { ns: 'common' })}</Text>
          <Text>{executionPeriod}</Text>
        </Flex>
      )}
    </Box>
  );
}
