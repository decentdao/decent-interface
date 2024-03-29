import { Box, Button, Divider, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { DAO_ROUTES } from '../../../constants/routes';
import { useFractal } from '../../../providers/App/AppProvider';

export function ConfirmModifyGovernanceModal({ close }: { close: () => void }) {
  const { t } = useTranslation('modals');
  const {
    node: { daoAddress, daoNetwork },
  } = useFractal();

  if (!daoNetwork || !daoAddress) {
    return <></>;
  }

  return (
    <Box>
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
      <Link to={DAO_ROUTES.modifyGovernance.relative(daoNetwork, daoAddress)}>
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
