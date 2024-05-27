import { Box, Flex, Text } from '@chakra-ui/react';
import { Scroll } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { useFractal } from '../../../../providers/App/AppProvider';
import { FractalProposalState } from '../../../../types';
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
    : proposals.filter(proposal => proposal.state === FractalProposalState.EXECUTED).length;

  const active = !proposals
    ? 0
    : proposals.filter(
        proposal =>
          proposal.state === FractalProposalState.ACTIVE ||
          proposal.state === FractalProposalState.EXECUTABLE,
      ).length;

  return (
    <Box data-testid="dashboard-daoProposals">
      <Flex
        alignItems="center"
        gap="0.4rem"
        mb="0.5rem"
      >
        <Scroll size="1.5rem" />
        <Text textStyle="display-lg">{t('titleProposals')}</Text>
      </Flex>

      <Flex
        alignItems="center"
        justifyContent="space-between"
        mb="0.25rem"
        gap="0.5rem"
      >
        <Text color="neutral-7">{t('titlePending')}</Text>
        <Text>{active}</Text>
      </Flex>
      <Flex
        alignItems="center"
        justifyContent="space-between"
        mb="0.25rem"
      >
        <Text color="neutral-7">{t('titlePassed')}</Text>
        <Text>{passed}</Text>
      </Flex>
    </Box>
  );
}
