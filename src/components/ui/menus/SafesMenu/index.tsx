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
import { EaseOutComponent } from '../../utils/EaseOutComponent';
import { SafesList } from './SafesList';

export function SafesMenu() {
  const { t } = useTranslation('home');
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
          size="icon-lg"
          icon={
            <Icon
              as={Star}
              color="white-0"
              boxSize="1.5rem"
              aria-hidden
            />
          }
        />
      </Hide>

      <Show above="md">
        <Menu
          placement="bottom-end"
          offset={[0, 4]}
        >
          {({ isOpen }) => (
            <Fragment>
              <MenuButton
                as={Button}
                variant="tertiary"
                data-testid="header-favoritesMenuButton"
                p="0.75rem"
                color="white-0"
                border="1px solid transparent"
                borderRadius="0.5rem"
                _hover={{ color: 'white-0', bg: 'neutral-3' }}
                _active={{
                  color: 'white-0',
                  border: '1px solid',
                  borderColor: 'neutral-4',
                  bg: 'neutral-3',
                }}
              >
                <Flex
                  alignItems="center"
                  gap={2}
                >
                  <Text>{t('mySafes')}</Text>
                  <Icon
                    as={CaretDown}
                    boxSize="1.5rem"
                  />
                </Flex>
              </MenuButton>
              {isOpen && (
                <EaseOutComponent>
                  <SafesList />
                </EaseOutComponent>
              )}
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
