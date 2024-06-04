import { Box, MenuList } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { NEUTRAL_2_82_TRANSPARENT } from '../../../../constants/common';
import { useAccountFavorites } from '../../../../hooks/DAO/loaders/useFavorites';
import { SafeMenuItem } from './SafeMenuItem';

export function SafesList() {
  const { favoritesList } = useAccountFavorites();

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
            className="scroll-dark"
          >
            {favoritesList.map(favorite => (
              <SafeMenuItem
                key={favorite}
                network={favorite.split(':')[0]}
                address={favorite.split(':')[1]}
              />
            ))}
          </Box>
        )}
      </Box>
    </MenuList>
  );
}
