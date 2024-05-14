import { Box, BoxProps, Button, Tooltip, Icon } from '@chakra-ui/react';
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
        <Button
          variant="tertiary"
          size="icon-md"
          as={Button}
          onClick={() => toggleFavorite(safeAddress)}
          aria-label={t('favoriteTooltip')}
          padding="0.25rem"
          height="fit-content"
        >
          <Icon
            boxSize="1.25rem"
            as={Star}
            weight={isFavorite ? 'fill' : 'regular'}
          />
        </Button>
      </Tooltip>
    </Box>
  );
}
