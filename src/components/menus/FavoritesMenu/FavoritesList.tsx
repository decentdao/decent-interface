import { Box, MenuList, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useWeb3Provider } from '../../../contexts/web3Data/hooks/useWeb3Provider';
import useFavorites from '../../../hooks/useFavorites';
import { Favorite } from './Favorite';

export function FavoritesList() {
  const {
    state: { chainId },
  } = useWeb3Provider();

  const { favorites } = useFavorites();

  const [chainFavorites, setChainFavorites] = useState<string[]>([]);

  useEffect(() => {
    if (!chainId) {
      setChainFavorites([]);
      return;
    }

    if (!favorites[chainId]) {
      setChainFavorites([]);
      return;
    }

    setChainFavorites(favorites[chainId]);
  }, [favorites, chainId]);

  const { t } = useTranslation('dashboard');
  return (
    <MenuList
      rounded="lg"
      shadow={'0px 0px 48px rgba(250, 189, 46, 0.48)'}
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
          {chainFavorites.length === 0 ? (
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
              {chainFavorites.map(favorite => (
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
