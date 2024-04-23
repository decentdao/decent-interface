import { Box, BoxProps, Button, IconButton, Tooltip } from '@chakra-ui/react';
import { Star } from '@phosphor-icons/react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getAddress } from 'viem';
import { useAccountFavorites } from '../../../hooks/DAO/loaders/useFavorites';

interface Props extends BoxProps {
  safeAddress: string;
}

export function FavoriteIcon({ safeAddress, ...rest }: Props) {
  const { favoritesList, toggleFavorite } = useAccountFavorites();
  const isFavorite = useMemo(
    () => (!!safeAddress ? favoritesList.includes(getAddress(safeAddress)) : false),
    [favoritesList, safeAddress],
  );
  const { t } = useTranslation();
  return (
    <Box {...rest}>
      <Tooltip label={t('favoriteTooltip')}>
        <IconButton
          variant="tertiary"
          p="0.5rem"
          size="md"
          as={Button}
          icon={<Star weight={isFavorite ? 'fill' : 'regular'} />}
          onClick={() => toggleFavorite(safeAddress)}
          aria-label={t('favoriteTooltip')}
        />
      </Tooltip>
    </Box>
  );
}
