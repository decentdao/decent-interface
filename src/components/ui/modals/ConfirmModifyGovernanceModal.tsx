import { Box, Flex, Button, Divider, Text } from '@chakra-ui/react';
import { Alert } from '@decent-org/fractal-ui';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { DAO_ROUTES } from '../../../constants/routes';
import { useFractal } from '../../../providers/App/AppProvider';

export function ConfirmModifyGovernanceModal({ close }: { close: () => void }) {
  const { t } = useTranslation('modals');
  const {
    node: { daoAddress },
  } = useFractal();

  return (
    <Box>
      <Flex>
        <Alert marginRight="1rem" />
        <Text
          marginBottom="1rem"
          color="grayscale.100"
          textStyle="text-xl-mono-medium"
        >
          {t('confirmModifyGovernanceTitle')}
        </Text>
      </Flex>
      <Divider
        color="chocolate.700"
        marginBottom="1rem"
      />
      <Text
        marginBottom="1rem"
        textStyle="text-base-sans-regular"
      >
        {t('confirmModifyGovernanceDescription')}
      </Text>
      <Divider
        color="chocolate.700"
        marginBottom="1rem"
      />
      <Text
        marginBottom="1rem"
        textStyle="text-xl-mono-medium"
      >
        {t('confirmAction')}
      </Text>
      <Link href={DAO_ROUTES.modifyGovernance.relative(daoAddress)}>
        <Button
          width="100%"
          onClick={close}
        >
          {t('modalContinue')}
        </Button>
      </Link>
      <Button
        marginTop="0.5rem"
        width="100%"
        variant="tertiary"
        onClick={close}
      >
        {t('modalCancel')}
      </Button>
    </Box>
  );
}
