import { Box, Flex, Text, Button } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { DAO_ROUTES } from '../../../../constants/routes';
import useDisplayName from '../../../../hooks/utils/useDisplayName';

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
  const { push } = useRouter();
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
        onClick={() => {
          onClickView();
          if (closeDrawer) closeDrawer();
          push(DAO_ROUTES.dao.relative(address));
        }}
        cursor="default"
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
              {t('labelDAOFound')}
            </Text>
            <DAONameDisplay address={address} />
          </Flex>
        </Flex>
        <Button
          alignSelf="center"
          data-testid="search-viewDAO"
        >
          {t('labelViewDAO')}
        </Button>
      </Flex>
    );
  }
  return null;
}
