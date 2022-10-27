import { Flex, Menu, MenuButton, Text } from '@chakra-ui/react';
import { StarOutline } from '@decent-org/fractal-ui';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { FavoritesList } from './FavoritesList';

export function FavoritesMenu() {
  const { t } = useTranslation('menu');
  return (
    <Menu isLazy>
      <Fragment>
        <MenuButton data-testid="header-favoritesMenuButton">
          <Flex
            gap="2"
            alignItems="center"
          >
            <StarOutline color="gold.500" />
            <Text
              textStyle="text-sm-mono-medium"
              color="gold.500"
            >
              {t('titleFavorites')}
            </Text>
          </Flex>
        </MenuButton>
        <FavoritesList />
      </Fragment>
    </Menu>
  );
}
