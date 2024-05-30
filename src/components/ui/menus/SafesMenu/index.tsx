import {
  Box,
  Button,
  Flex,
  Hide,
  Icon,
  IconButton,
  Menu,
  MenuButton,
  Show,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { CaretDown, Star } from '@phosphor-icons/react';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { AllSafesDrawer } from '../../../../pages/home/AllSafesDrawer';
import { SafesList } from './SafesList';

export function SafesMenu() {
  const { t } = useTranslation('dashboard');
  const {
    isOpen: isSafesDrawerOpen,
    onOpen: onSafesDrawerOpen,
    onClose: onSafesDrawerClose,
  } = useDisclosure();

  return (
    <Box>
      <Hide above="md">
        <IconButton
          variant="tertiary"
          aria-label="Search Safe"
          onClick={onSafesDrawerOpen}
          size="icon-sm"
          icon={
            <Icon
              as={Star}
              color="lilac-0"
              aria-hidden
              weight="fill"
            />
          }
        />
      </Hide>

      <Show above="md">
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
                p="0.75rem"
              >
                <Flex
                  alignItems="center"
                  gap={2}
                >
                  <Text>{t('titleFavorites')}</Text>
                  <Icon
                    as={CaretDown}
                    boxSize="1.5rem"
                  />
                </Flex>
              </MenuButton>
              {isOpen && <SafesList />}
            </Fragment>
          )}
        </Menu>
      </Show>

      <AllSafesDrawer
        isOpen={isSafesDrawerOpen}
        onClose={onSafesDrawerClose}
        onOpen={onSafesDrawerOpen}
      />
    </Box>
  );
}
