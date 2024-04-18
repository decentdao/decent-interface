import {
  Box,
  Divider,
  Drawer,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  Flex,
  Hide,
  IconButton,
  Show,
  useDisclosure,
} from '@chakra-ui/react';
import { DecentLogo } from '@decent-org/fractal-ui';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { BASE_ROUTES } from '../../../../constants/routes';
import { useFractal } from '../../../../providers/App/AppProvider';
import { AccountDisplay } from '../../menus/AccountDisplay';
import { DAOSearch } from '../../menus/DAOSearch';
import { FavoritesMenu } from '../../menus/FavoritesMenu';
import { NavigationLinks } from '../Navigation/NavigationLinks';

function HeaderLogo() {
  const { t } = useTranslation('navigation');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef<HTMLButtonElement | null>(null);

  const {
    node: { daoAddress },
  } = useFractal();

  const showDAOLinks = !!daoAddress;
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
              <DecentLogo
                aria-hidden
                h="2.5rem"
                w="2.125rem"
              />
            }
          />
          <Drawer
            placement="left"
            isOpen={isOpen}
            onClose={onClose}
            size="full"
            isFullHeight
          >
            <DrawerOverlay />
            <DrawerContent
              bg="chocolate.900"
              border="none"
            >
              <DrawerCloseButton
                size="lg"
                zIndex="banner"
              />

              <Box
                mt={12}
                px={8}
                position="relative"
              >
                <DAOSearch closeDrawer={onClose} />
              </Box>
              <Flex
                alignItems="center"
                direction="column"
                justifyContent={showDAOLinks ? 'space-evenly' : 'flex-start'}
                flexGrow={1}
                overflowY="auto"
                px={8}
                pt={8}
              >
                <Divider color="chocolate.700" />
                <NavigationLinks
                  showDAOLinks={showDAOLinks}
                  address={daoAddress}
                  closeDrawer={onClose}
                />
              </Flex>
            </DrawerContent>
          </Drawer>
        </>
      </Hide>
      <Show above="md">
        <Link
          data-testid="navigationLogo-homeLink"
          to={BASE_ROUTES.landing}
          aria-label={t('ariaLabelFractalBrand')}
        >
          <DecentLogo
            aria-hidden
            h="2.5rem"
            w="2.125rem"
            mx="2rem"
          />
        </Link>
      </Show>
    </Flex>
  );
}
function Header() {
  return (
    <Flex
      h="full"
      w="full"
      justifyContent="space-between"
      pe="0.5rem"
      alignItems="center"
    >
      <HeaderLogo />
      <Show above="md">
        <DAOSearch />
      </Show>
      <Flex
        h="full"
        w="full"
        justifyContent="flex-end"
      >
        <FavoritesMenu />
        <AccountDisplay />
      </Flex>
    </Flex>
  );
}

export default Header;
