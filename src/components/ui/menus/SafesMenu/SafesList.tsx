import { Box, MenuList } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { NEUTRAL_2_82_TRANSPARENT } from '../../../../constants/common';
import { useAccountFavorites } from '../../../../hooks/DAO/loaders/useFavorites';
import { useNetworkConfig } from '../../../../providers/NetworkConfig/NetworkConfigProvider';
import Divider from '../../utils/Divider';
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
      <Box py="0.25rem">
        {favoritesList.length === 0 ? (
          <Box p="1rem 1rem">{t('emptyFavorites')}</Box>
        ) : (
          <Box
            maxHeight="20rem"
            overflowY="scroll"
            className="scroll-dark"
          >
            {favoritesList.map((favorite, i) => (
              <Box key={favorite}>
                <SafeMenuItem
                  network={addressPrefix}
                  address={favorite}
                />
                {favoritesList.length - 1 !== i && <Divider my="0.25rem" />}
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </MenuList>
  );
}
