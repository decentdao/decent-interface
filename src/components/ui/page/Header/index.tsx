import {
  Box,
  Drawer,
  DrawerOverlay,
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
import {
  HEADER_HEIGHT,
  MOBILE_DRAWER_OVERLAY,
  NEUTRAL_2_82_TRANSPARENT,
  SEXY_BOX_SHADOW_T_T,
} from '../../../../constants/common';
import { BASE_ROUTES } from '../../../../constants/routes';
import { AccountDisplay } from '../../menus/AccountDisplay';
import { SafesMenu } from '../../menus/SafesMenu';
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
