import { Box, Flex, Text } from '@chakra-ui/react';
import { Proposals } from '@decent-org/fractal-ui';
import { useTranslation } from 'react-i18next';
import { useFractal } from '../../../../providers/App/AppProvider';
import { TxProposalState } from '../../../../types';
import { BarLoader } from '../../../ui/loaders/BarLoader';

interface IDAOGovernance {}

export function InfoProposals({}: IDAOGovernance) {
  const { t } = useTranslation('dashboard');
  const {
    node: { daoAddress },
    governance: { proposals, type },
  } = useFractal();

  if (!daoAddress || !type) {
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
  const passed = !proposals
    ? 0
    : proposals.reduce(
        (prev, proposal) => (proposal.state === TxProposalState.Executed ? prev + 1 : prev),
        0
      );

  const active = !proposals
    ? 0
    : proposals.reduce(
        (prev, proposal) =>
          proposal.state === TxProposalState.Active || proposal.state === TxProposalState.Executing
            ? prev + 1
            : prev,
        0
      );

  return (
    <Box data-testid="dashboard-daoProposals">
      <Flex
        alignItems="center"
        gap="0.5rem"
        mb="1rem"
      >
        <Proposals />
        <Text
          textStyle="text-sm-sans-regular"
          color="grayscale.100"
        >
          {t('titleProposals')}
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
          {t('titlePending')}
        </Text>
        <Text
          textStyle="text-base-sans-regular"
          color="grayscale.100"
        >
          {active}
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
          {t('titlePassed')}
        </Text>
        <Text
          textStyle="text-base-sans-regular"
          color="grayscale.100"
        >
          {passed}
        </Text>
      </Flex>
    </Box>
  );
}
