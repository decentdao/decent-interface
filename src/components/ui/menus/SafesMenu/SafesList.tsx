import { Box, MenuList } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { NEUTRAL_2_82_TRANSPARENT } from '../../../../constants/common';
import { useAccountFavorites } from '../../../../hooks/DAO/loaders/useFavorites';
import { decodePrefixedAddress } from '../../../../utils/address';
import Divider from '../../utils/Divider';
import { ErrorBoundary } from '../../utils/ErrorBoundary';
import { MySafesErrorFallback } from '../../utils/MySafesErrorFallback';
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
      <ErrorBoundary fallback={MySafesErrorFallback}>
        <Box py="0.25rem">
          {favoritesList.length === 0 ? (
            <Box p="1rem 1rem">{t('emptyFavorites')}</Box>
          ) : (
            <Box
              maxHeight="20rem"
              className="scroll-dark"
            >
              {favoritesList.map((favorite, i) => (
                <Box key={favorite}>
                  <SafeMenuItem {...decodePrefixedAddress(favorite)} />
                  {favoritesList.length - 1 !== i && <Divider my="0.25rem" />}
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </ErrorBoundary>
    </MenuList>
  );
}
