import { Box, MenuList } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useAccountFavorites } from '../../../../hooks/DAO/loaders/useFavorites';
import { useNetworkConfig } from '../../../../providers/NetworkConfig/NetworkConfigProvider';
import { Favorite } from './Favorite';

export function FavoritesList() {
  const { favoritesList } = useAccountFavorites();
  const { addressPrefix } = useNetworkConfig();

  const { t } = useTranslation('dashboard');
  return (
    <MenuList
      rounded="0.5rem"
      boxShadow="0px 1px 0px 0px var(--chakra-colors-neutral-1)"
      bg="rgba(38, 33, 42, 0.74)"
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
                background: 'neutral-3',
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
            {favoritesList.map(
              favorite => (
                <Favorite
                  key={favorite}
                  network={addressPrefix}
                  address={favorite}
                />
              ),
            )}
          </Box>
        )}
      </Box>
    </MenuList>
  );
}
