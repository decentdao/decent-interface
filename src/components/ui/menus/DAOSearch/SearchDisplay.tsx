import { Box, Flex, Text, Button } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import useDisplayName from '../../../../hooks/utils/useDisplayName';
import { DAO_ROUTES } from '../../../../routes/constants/dao';

interface ISearchDisplay {
  loading?: boolean;
  errorMessage?: string;
  validAddress?: boolean;
  address?: string;
  onClickView: Function;
  closeDrawer?: () => void;
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
  const navigate = useNavigate();

  const { displayName } = useDisplayName(address);
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
          navigate(DAO_ROUTES.dao.relative(address));
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
            <Text textStyle="text-base-sans-medium">{displayName}</Text>
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
