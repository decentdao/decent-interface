import { Box, MenuList, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useFractal } from '../../../providers/Fractal/hooks/useFractal';
import { Favorite } from './Favorite';

export function FavoritesList() {
  const {
    account: {
      favorites: { favoritesList },
    },
  } = useFractal();

  const { t } = useTranslation('dashboard');
  return (
    <MenuList
      rounded="lg"
      shadow="menu-gold"
      mr={['auto', '1rem']}
      bg="grayscale.black"
      border="none"
      padding="1rem"
    >
      <Box>
        <Text
          textStyle="text-sm-sans-regular"
          color="chocolate.200"
        >
          {t('titleFavorites')}
        </Text>
        <Box mt="0.5rem">
          {favoritesList.length === 0 ? (
            <Box>{t('emptyFavorites')}</Box>
          ) : (
            <Box
              maxHeight="15rem"
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
      </Box>
    </MenuList>
  );
}
