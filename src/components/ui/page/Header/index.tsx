import {
  Box,
  Drawer,
  DrawerCloseButton,
  DrawerContent,
  Flex,
  Hide,
  IconButton,
  Show,
  useDisclosure,
} from '@chakra-ui/react';
import { DecentLogo } from '@decent-org/fractal-ui';
import { useRef, RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { HEADER_HEIGHT, NEUTRAL_2_82_TRANSPARENT } from '../../../../constants/common';
import { BASE_ROUTES } from '../../../../constants/routes';
import { useFractal } from '../../../../providers/App/AppProvider';
import { AccountDisplay } from '../../menus/AccountDisplay';
import { DAOSearch } from '../../menus/DAOSearch';
import { SafesMenu } from '../../menus/SafesMenu';
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
            boxSize="4rem"
            w={0}
            aria-label="navigation"
            minW={0}
            variant="unstyled"
            icon={
              <DecentLogo
                aria-hidden
                h="2.5rem"
                w="2.125rem"
                ml="1.5rem"
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
            <DrawerContent
              bg={NEUTRAL_2_82_TRANSPARENT}
              border="none"
              backdropFilter="auto"
              backdropBlur="10px"
            >
              <Flex
                mt={4}
                justifyContent="space-between"
              >
                <Link
                  data-testid="navigationLogo-homeLink"
                  to={BASE_ROUTES.landing}
                  aria-label={t('ariaLabelFractalBrand')}
                  onClick={onClose}
                >
                  <DecentLogo
                    aria-hidden
                    h="2.5rem"
                    w="2.125rem"
                    ml="1.75rem"
                  />
                </Link>
                <DrawerCloseButton
                  size="lg"
                  zIndex="banner"
                  color="lilac-0"
                  position="relative"
                  top="0px"
                />
              </Flex>
              <Box
                px={6}
                pt={8}
              >
                <NavigationLinks
                  showDAOLinks={showDAOLinks}
                  address={daoAddress}
                  closeDrawer={onClose}
                />
              </Box>
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
            mx="1.75rem"
          />
        </Link>
      </Show>
    </Flex>
  );
}
function Header({ headerContainerRef }: { headerContainerRef: RefObject<HTMLDivElement | null> }) {
  return (
    <Flex
      w="full"
      justifyContent="space-between"
      alignItems="center"
      pr="1.5rem"
      maxW="100vw"
    >
      <HeaderLogo />
      <Show above="md">
        <DAOSearch />
      </Show>
      <Flex
        w="full"
        h={HEADER_HEIGHT}
        justifyContent="flex-end"
        alignItems="center"
      >
        <SafesMenu />
        <AccountDisplay containerRef={headerContainerRef} />
      </Flex>
    </Flex>
  );
}

export default Header;
