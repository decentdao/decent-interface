import { Box, MenuList } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useAccountFavorites } from '../../../../hooks/DAO/loaders/useFavorites';
import { Favorite } from './Favorite';

export function FavoritesList() {
  const { favoritesList } = useAccountFavorites();

  const { t } = useTranslation('dashboard');
  return (
    <MenuList
      rounded="lg"
      shadow="menu-gold"
      mr={['auto', '1rem']}
      bg="grayscale.black"
      border="none"
      padding="0rem"
    >
      <Box>
        {favoritesList.length === 0 ? (
          <Box p="1rem 1rem">{t('emptyFavorites')}</Box>
        ) : (
          <Box
            p="0.5rem 1rem"
            maxHeight="20rem"
            overflowY="scroll"
            sx={{
              '&::-webkit-scrollbar': {
                background: 'transparent',
                width: '0.5rem',
                height: '0.5rem',
              },
              '&::-webkit-scrollbar-thumb': {
                border: 'none',
                boxShadow: 'none',
                background: 'grayscale.500',
                borderRadius: '0.5rem',
                minHeight: '2.5rem',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                backgroundColor: 'grayscale.300',
              },
            }}
          >
            {favoritesList.map(favorite => (
              <Favorite
                key={favorite}
                address={favorite}
              />
            ))}
          </Box>
        )}
      </Box>
    </MenuList>
  );
}
