import { Flex, Text } from '@chakra-ui/react';
import { Proposals } from '@decent-org/fractal-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { BarLoader } from '../../../components/ui/loaders/BarLoader';
import { useFractal } from '../../../providers/Fractal/hooks/useFractal';
import { DAO_ROUTES } from '../../../routes/constants';

interface IDAOGovernance {}

export function InfoProposals({}: IDAOGovernance) {
  const { t } = useTranslation('dashboard');
  const {
    gnosis: { safe },
    governance: {
      txProposalsInfo: { passed, pending },
      governanceIsLoading,
    },
  } = useFractal();

  if (!safe.address || governanceIsLoading) {
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

  return (
    <Link
      data-testid="dashboard-daoProposals"
      to={DAO_ROUTES.proposals.relative(safe.address)}
      aria-label="Proposals Info Link"
    >
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
          {pending}
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
    </Link>
  );
}
