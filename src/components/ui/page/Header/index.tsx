import {
  Box,
  Drawer,
  DrawerCloseButton,
  DrawerContent,
  Flex,
  Hide,
  IconButton,
  Icon,
  Show,
  useDisclosure,
} from '@chakra-ui/react';
import { DecentLogo } from '@decent-org/fractal-ui';
import { MagnifyingGlass, List } from '@phosphor-icons/react';
import { useRef, RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useHeaderHeight, NEUTRAL_2_82_TRANSPARENT } from '../../../../constants/common';
import { BASE_ROUTES } from '../../../../constants/routes';
import { useFractal } from '../../../../providers/App/AppProvider';
import { AccountDisplay } from '../../menus/AccountDisplay';
import { DAOSearch } from '../../menus/DAOSearch';
import { SafesMenu } from '../../menus/SafesMenu';
import { ModalType } from '../../modals/ModalProvider';
import { useFractalModal } from '../../modals/useFractalModal';
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
            aria-label="drawer-menu"
            onClick={onOpen}
            boxSize="2rem"
            variant="tertiary"
            ml="1rem"
            icon={
              <Icon
                as={List}
                color="lilac-0"
                p="0.25rem"
                aria-hidden
                h="1.875rem"
                w="1.875rem"
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
  const searchSafe = useFractalModal(ModalType.SEARCH_SAFE);
  const HEADER_HEIGHT = useHeaderHeight();

  return (
    <Flex
      w="full"
      justifyContent="space-between"
      alignItems="center"
      pr={{ base: '1rem', md: '1.5rem' }}
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
        gap={{ base: '0.25rem', md: '1rem' }}
      >
        <Hide above="md">
          <IconButton
            variant="tertiary"
            as={MagnifyingGlass}
            aria-label="Search Safe"
            onClick={searchSafe}
            h="2.75rem"
            w="2.75rem"
            p="0.5rem"
            cursor="pointer"
          />
        </Hide>
        <SafesMenu />
        <AccountDisplay containerRef={headerContainerRef} />
      </Flex>
    </Flex>
  );
}

export default Header;
