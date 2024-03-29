import { Box, Flex, Text, Button } from '@chakra-ui/react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { DAO_ROUTES } from '../../../../constants/routes';
import useDisplayName from '../../../../hooks/utils/useDisplayName';
import { useFractal } from '../../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../../providers/NetworkConfig/NetworkConfigProvider';

interface ISearchDisplay {
  loading?: boolean;
  errorMessage?: string;
  validAddress?: boolean;
  address?: string;
  onClickView: Function;
  closeDrawer?: () => void;
}

function DAONameDisplay({ address }: { address: string }) {
  const { displayName } = useDisplayName(address);
  return <Text textStyle="text-base-sans-medium">{displayName}</Text>;
}

export function SearchDisplay({
  loading,
  errorMessage,
  validAddress,
  address,
  onClickView,
  closeDrawer,
}: ISearchDisplay) {
  const { t } = useTranslation(['common', 'dashboard']);
  const { action, node } = useFractal();
  const { addressPrefix } = useNetworkConfig();
  const navigate = useNavigate();
  const isCurrentSafe = useMemo(() => {
    return !!node && !!node.daoAddress && node.daoAddress === address;
  }, [node, address]);
  if (loading && address) {
    return (
      <Box>
        <Text textStyle="text-base-mono-regular">{t('loading')}</Text>
      </Box>
    );
  }
  if (errorMessage && !loading) {
    return (
      <Box>
        <Text textStyle="text-base-sans-medium">{errorMessage}</Text>
      </Box>
    );
  }
  if (validAddress && address && !loading) {
    return (
      <Flex
        py={2}
        cursor={isCurrentSafe ? 'not-allowed' : 'default'}
        justifyContent="space-between"
      >
        <Flex
          justifyContent="space-between"
          alignItems="center"
        >
          <Flex flexDirection="column">
            <Text
              textStyle="text-sm-sans-regular"
              color="chocolate.100"
            >
              {t(isCurrentSafe ? 'labelCurrentDAO' : 'labelDAOFound')}
            </Text>
            <DAONameDisplay address={address} />
          </Flex>
        </Flex>
        {!isCurrentSafe && (
          <Button
            alignSelf="center"
            data-testid="search-viewDAO"
            onClick={() => {
              onClickView();
              if (closeDrawer) closeDrawer();
              action.resetDAO();
              navigate(DAO_ROUTES.dao.relative(`${addressPrefix}:${address}`));
            }}
          >
            {t('labelViewDAO')}
          </Button>
        )}
      </Flex>
    );
  }
  return null;
}
