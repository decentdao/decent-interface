import { Flex, Text, Spinner, Button, Icon } from '@chakra-ui/react';
import { WarningCircle } from '@phosphor-icons/react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { DAO_ROUTES } from '../../../../constants/routes';
import useDAOName from '../../../../hooks/DAO/useDAOName';
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
  const { daoRegistryName } = useDAOName({ address });
  return <Text textStyle="display-lg">{daoRegistryName}</Text>;
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
      <Flex
        justifyContent="center"
        alignItems="center"
      >
        <Spinner
          thickness="4px"
          speed="0.75s"
          emptyColor="neutral-3"
          color="neutral-7"
          size="lg"
        />
      </Flex>
    );
  }
  if (errorMessage && !loading) {
    return (
      <Flex
        alignItems="center"
        gap="2"
      >
        <Icon
          as={WarningCircle}
          color="red-1"
          boxSize="1.5rem"
        />
        <Text
          textStyle="display-lg"
          color="red-1"
        >
          {errorMessage}
        </Text>
      </Flex>
    );
  }
  if (validAddress && address && !loading) {
    return (
      <Flex
        py={2}
        cursor={isCurrentSafe ? 'not-allowed' : 'default'}
        justifyContent="space-between"
        gap={8}
        w="full"
      >
        <Flex
          justifyContent="space-between"
          alignItems="center"
        >
          <Flex
            flexDirection="column"
            gap={2}
          >
            <Text
              textStyle="label-base"
              color="white-0"
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

              // TODO is this needed here?
              action.resetDAO();

              navigate(DAO_ROUTES.dao.relative(addressPrefix, address));
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
