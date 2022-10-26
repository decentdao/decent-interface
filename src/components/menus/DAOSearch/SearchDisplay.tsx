import { Box, Flex, Text } from '@chakra-ui/react';
import { Button } from '@decent-org/fractal-ui';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import useDisplayName from '../../../hooks/useDisplayName';
import { DAO_ROUTES } from '../../../routes/constants';

interface ISearchDisplay {
  loading?: boolean;
  errorMessage?: string;
  validAddress?: boolean;
  address?: string;
}

export function SearchDisplay({ loading, errorMessage, validAddress, address }: ISearchDisplay) {
  const { t } = useTranslation(['common', 'dashboard']);
  const navigate = useNavigate();

  const displayName = useDisplayName(address);
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
        flexDirection="column"
        alignItems="flex-start"
      >
        <Text
          textStyle="text-sm-sans-regular"
          color="chocolate.100"
        >
          {t('labelDAOFound')}
        </Text>
        <Flex
          justifyContent="space-between"
          alignItems="center"
          width="full"
        >
          <Text textStyle="text-base-sans-medium">{displayName}</Text>
          <Button onClick={() => navigate(DAO_ROUTES.dao.relative(address))}>
            {t('labelViewDAO')}
          </Button>
        </Flex>
      </Flex>
    );
  }
  return (
    <Box>
      <Text textStyle="text-base-sans-medium">{t('sublabelSearch', { ns: 'dashboard' })}</Text>
    </Box>
  );
}
