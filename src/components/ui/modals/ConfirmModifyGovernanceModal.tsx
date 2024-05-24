import { Box, Button, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { DAO_ROUTES } from '../../../constants/routes';
import { useFractal } from '../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import Divider from '../utils/Divider';

export function ConfirmModifyGovernanceModal({ close }: { close: () => void }) {
  const { t } = useTranslation('modals');
  const {
    node: { daoAddress },
  } = useFractal();
  const { addressPrefix } = useNetworkConfig();

  if (!daoAddress) {
    return null;
  }

  return (
    <Box>
      <Text
        marginBottom="1rem"
        textStyle="text-base-sans-regular"
      >
        {t('confirmModifyGovernanceDescription')}
      </Text>
      <Divider marginBottom="1rem" />
      <Text
        marginBottom="1rem"
        textStyle="text-xl-mono-medium"
      >
        {t('confirmAction')}
      </Text>
      <Link to={DAO_ROUTES.modifyGovernance.relative(addressPrefix, daoAddress)}>
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
