import { Box, BoxProps, Button, Tooltip, Icon } from '@chakra-ui/react';
import { Star } from '@phosphor-icons/react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getAddress } from 'viem';
import { useAccountFavorites } from '../../../hooks/DAO/loaders/useFavorites';

interface Props extends BoxProps {
  safeAddress: string;
  variant?: 'lil-smaller';
}

export function FavoriteIcon({ safeAddress, variant, ...rest }: Props) {
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
          padding={variant === 'lil-smaller' ? '0.3rem' : '0.5rem'}
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
