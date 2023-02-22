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
import { useFractal } from '../../../../providers/Fractal/hooks/useFractal';
import { BASE_ROUTES } from '../../../../routes/constants';
import { DAOSearch } from '../../menus/DAOSearch';
import { NavigationLinks } from './NavigationLinks';

function Sidebar() {
  const { t } = useTranslation('nagivation');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = React.useRef<HTMLButtonElement | null>(null);

  const {
    gnosis: {
      safe: { address },
      safeService,
      isGnosisLoading,
    },
  } = useFractal();

  const showDAOLinks = !!address && !!safeService && !isGnosisLoading;
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
                justifyContent={showDAOLinks ? 'space-evenly' : 'flex-start'}
                flexGrow={1}
              >
                <NavigationLinks showDAOLinks={showDAOLinks} />
              </Flex>
            </DrawerContent>
          </Drawer>
        </>
      </Hide>
      <Hide below="md">
        <Link
          data-testid="navigationLogo-homeLink"
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
        <NavigationLinks showDAOLinks={showDAOLinks} />
      </Show>
    </Flex>
  );
}

export default Sidebar;
