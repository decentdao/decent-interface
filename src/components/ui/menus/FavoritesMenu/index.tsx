import { Button, Flex, Menu, MenuButton, Show, Text } from '@chakra-ui/react';
import { CaretDown, Star } from '@phosphor-icons/react';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { FavoritesList } from './FavoritesList';

export function FavoritesMenu() {
  const { t } = useTranslation('dashboard');
  return (
    <Menu>
      {({ isOpen }) => (
        <Fragment>
          <Button
            as={MenuButton}
            variant="tertiary"
            data-testid="header-favoritesMenuButton"
            my="0.75rem"
            mx="1rem"
          >
            <Flex alignItems="center">
              <Star
                size="1.5rem"
                color="var(--chakra-colors-neutral-8)"
                weight="fill"
              />
              <Show above="md">
                <Text
                  mx="0.5rem"
                  textStyle="button-base"
                >
                  {t('titleFavorites')}
                </Text>
                <CaretDown
                  color="var(--chakra-colors-neutral-8)"
                  size="1.5rem"
                />
              </Show>
            </Flex>
          </Button>
          {isOpen && <FavoritesList />}
        </Fragment>
      )}
    </Menu>
  );
}
