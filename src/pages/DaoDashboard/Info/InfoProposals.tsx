import { Box, Flex, Text } from '@chakra-ui/react';
import { Proposals } from '@decent-org/fractal-ui';
import { useTranslation } from 'react-i18next';
import { useFractal } from '../../../providers/Fractal/hooks/useFractal';

interface IDAOGovernance {}

export function InfoProposals({}: IDAOGovernance) {
  const { t } = useTranslation('dashboard');
  const {
    governance: {
      txProposalsInfo: { passed, pending },
    },
  } = useFractal();

  // @todo replace mocked values
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
    </Box>
  );
}
