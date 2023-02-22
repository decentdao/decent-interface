import {
  Drawer,
  DrawerCloseButton,
  DrawerContent,
  Flex,
  Hide,
  IconButton,
  Show,
  useDisclosure,
} from '@chakra-ui/react';
import { FractalBrandBurger, FractalBrand } from '@decent-org/fractal-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { BASE_ROUTES } from '../../../../routes/constants';
import { DAOSearch } from '../../menus/DAOSearch';
import { NavigationLinks } from './NavigationLinks';

function Sidebar() {
  const { t } = useTranslation('sidebar');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = React.useRef<HTMLButtonElement | null>(null);
  return (
    <Flex
      alignItems="center"
      direction="column"
      justifyContent="space-between"
      flexGrow={1}
    >
      <Hide above="md">
        <>
          <IconButton
            ref={btnRef}
            onClick={onOpen}
            display="flex"
            boxSize="4rem"
            justifyContent="center"
            alignItems="center"
            aria-label="navigation"
            minW={0}
            variant="unstyled"
            icon={
              <FractalBrandBurger
                aria-hidden
                boxSize="2rem"
              />
            }
          />
          <Drawer
            placement="left"
            isOpen={isOpen}
            onClose={onClose}
            finalFocusRef={btnRef}
            size="full"
          >
            <DrawerContent
              bg="chocolate.900"
              border="none"
              p={8}
            >
              <DrawerCloseButton size="lg" />
              <Flex
                mt={8}
                h="4rem"
                justifyContent="center"
              >
                <DAOSearch />
              </Flex>
              <Flex
                alignItems="center"
                direction="column"
                justifyContent="space-around"
                flexGrow={1}
              >
                <NavigationLinks />
              </Flex>
            </DrawerContent>
          </Drawer>
        </>
      </Hide>
      <Hide below="md">
        <Link
          data-testid="sidebarLogo-homeLink"
          to={BASE_ROUTES.landing}
          aria-label={t('ariaLabelFractalBrand')}
        >
          <FractalBrand
            aria-hidden
            boxSize="4rem"
          />
        </Link>
      </Hide>
      <Show above="md">
        <NavigationLinks />
      </Show>
    </Flex>
  );
}

export default Sidebar;
