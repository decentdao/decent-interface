import { Flex, Menu, MenuButton, Text } from '@chakra-ui/react';
import { StarGoldSolid } from '@decent-org/fractal-ui';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import DownArrow from '../../ui/svg/DownArrow';
import { FavoritesList } from './FavoritesList';

export function FavoritesMenu() {
  const { t } = useTranslation('dashboard');
  return (
    <Menu isLazy>
      <Fragment>
        <MenuButton
          data-testid="header-favoritesMenuButton"
          h="full"
          mx="1.5rem"
          color="gold.500"
          _hover={{
            color: 'gold.500-hover',
          }}
        >
          <Flex alignItems="center">
            <StarGoldSolid />
            <Text
              mx="0.5rem"
              textStyle="text-sm-mono-medium"
            >
              {t('titleFavorites')}
            </Text>
            <DownArrow />
          </Flex>
        </MenuButton>
        <FavoritesList />
      </Fragment>
    </Menu>
  );
}
