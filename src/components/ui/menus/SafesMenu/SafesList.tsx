import { Box, MenuList } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { NEUTRAL_2_82_TRANSPARENT } from '../../../../constants/common';
import { useAccountFavorites } from '../../../../hooks/DAO/loaders/useFavorites';
import { useNetworkConfig } from '../../../../providers/NetworkConfig/NetworkConfigProvider';
import { SafeMenuItem } from './SafeMenuItem';

export function SafesList() {
  const { favoritesList } = useAccountFavorites();
  const { addressPrefix } = useNetworkConfig();

  const { t } = useTranslation('dashboard');
  return (
    <MenuList
      rounded="0.5rem"
      bg={NEUTRAL_2_82_TRANSPARENT}
      backdropFilter="auto"
      backdropBlur="10px"
      border="1px solid"
      borderColor="neutral-3"
    >
      <Box>
        {favoritesList.length === 0 ? (
          <Box p="1rem 1rem">{t('emptyFavorites')}</Box>
        ) : (
          <Box
            maxHeight="20rem"
            overflowY="scroll"
            sx={{
              '&::-webkit-scrollbar': {
                width: '0.5rem',
                height: '0.5rem',
              },
              '&::-webkit-scrollbar-thumb': {
                border: 'none',
                boxShadow: 'none',
                background: 'neutral-4',
                borderRadius: '0.5rem',
                minHeight: '2.5rem',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                backgroundColor: 'neutral-4',
              },
            }}
          >
            {favoritesList
              .map(favorite => (
                <SafeMenuItem
                  key={favorite}
                  network={addressPrefix}
                  address={favorite}
                />
              ))}
          </Box>
        )}
      </Box>
    </MenuList>
  );
}
