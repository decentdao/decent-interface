import {
  Box,
  Drawer,
  DrawerOverlay,
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
import {
  useHeaderHeight,
  MOBILE_DRAWER_OVERLAY,
  NEUTRAL_2_82_TRANSPARENT,
  SEXY_BOX_SHADOW_T_T,
} from '../../../../constants/common';
import { BASE_ROUTES } from '../../../../constants/routes';
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
            size="icon-lg"
            variant="tertiary"
            icon={
              <Icon
                boxSize="2rem"
                as={List}
                color="lilac-0"
                aria-hidden
              />
            }
          />
          <Drawer
            placement="left"
            isOpen={isOpen}
            onClose={onClose}
            isFullHeight
          >
            <DrawerOverlay
              bg={MOBILE_DRAWER_OVERLAY}
              backdropFilter="blur(6px)"
            />
            <DrawerContent
              bg={NEUTRAL_2_82_TRANSPARENT}
              border="none"
              borderTopRightRadius="1rem"
              borderBottomRightRadius="1rem"
              boxShadow={SEXY_BOX_SHADOW_T_T}
            >
              <Flex p="1rem">
                <Link
                  data-testid="navigationLogo-homeLink"
                  to={BASE_ROUTES.landing}
                  aria-label={t('ariaLabelFractalBrand')}
                  onClick={onClose}
                >
                  <DecentLogo
                    aria-hidden
                    h="1.8rem"
                    w="1.5rem"
                  />
                </Link>
              </Flex>
              <Box mt="1rem">
                <NavigationLinks closeDrawer={onClose} />
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
            mr="1.75rem"
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
      bg={NEUTRAL_2_82_TRANSPARENT}
      justifyContent="space-between"
      alignItems="center"
      px={{ base: '1rem', md: '1.5rem' }}
      maxW="100vw"
      borderBottom="1px"
      borderBottomColor="neutral-3"
      // Doesn't seem to work either way arghhh
      box-shadow={{
        base: '0px -1px 0px 0px rgba(255, 255, 255, 0.04) inset, 0px 0px 0px 1px #100414;',
        md: '0px',
      }}
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
        gap={{ base: '0rem', md: '1rem' }}
      >
        <Hide above="md">
          <IconButton
            variant="tertiary"
            aria-label="Search Safe"
            onClick={searchSafe}
            size="icon-sm"
            icon={
              <Icon
                as={MagnifyingGlass}
                color="lilac-0"
                aria-hidden
              />
            }
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
