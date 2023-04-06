import { Flex, Menu, MenuButton, Show, Text } from '@chakra-ui/react';
import { ArrowDown, StarGoldSolid } from '@decent-org/fractal-ui';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { FavoritesList } from './FavoritesList';

export function FavoritesMenu() {
  const { t } = useTranslation('dashboard');
  return (
    <Menu isLazy>
      {({ isOpen }) => (
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
              <StarGoldSolid boxSize="1.5rem" />
              <Show above="md">
                <Text
                  mx="0.5rem"
                  textStyle="text-sm-mono-medium"
                >
                  {t('titleFavorites')}
                </Text>
                <ArrowDown />
              </Show>
            </Flex>
          </MenuButton>
          {isOpen && <FavoritesList />}
        </Fragment>
      )}
    </Menu>
  );
}
