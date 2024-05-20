import { Button, Flex, Icon, Menu, MenuButton, Show, Text } from '@chakra-ui/react';
import { CaretDown, Star } from '@phosphor-icons/react';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { SafesList } from './SafesList';

export function SafesMenu() {
  const { t } = useTranslation('dashboard');
  return (
    <Menu
      placement="bottom-end"
      offset={[0, 16]}
    >
      {({ isOpen }) => (
        <Fragment>
          <MenuButton
            as={Button}
            variant="tertiary"
            data-testid="header-favoritesMenuButton"
            mx={{ base: 0, md: '1rem' }}
          >
            <Flex
              alignItems="center"
              gap={2}
            >
              <Icon
                as={Star}
                boxSize="1.5rem"
                weight="fill"
              />
              <Show above="md">
                <Text>{t('titleFavorites')}</Text>
                <Icon
                  as={CaretDown}
                  boxSize="1.5rem"
                />
              </Show>
            </Flex>
          </MenuButton>
          {isOpen && <SafesList />}
        </Fragment>
      )}
    </Menu>
  );
}
