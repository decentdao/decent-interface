import { Flex, Hide, Menu, MenuButton, MenuList, Show } from '@chakra-ui/react';
import { FractalBrandBurger, FractalBrand } from '@decent-org/fractal-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { BASE_ROUTES } from '../../../../routes/constants';
import { NavigationLinks } from './NavigationLinks';

function Sidebar() {
  const { t } = useTranslation('sidebar');
  return (
    <Flex
      alignItems="center"
      direction="column"
      flexGrow="1"
      justifyContent="space-between"
    >
      <Hide above="md">
        <Flex
          boxSize="4rem"
          justifyContent="center"
          alignItems="center"
        >
          <Menu>
            <MenuButton>
              <FractalBrandBurger
                aria-hidden
                boxSize="2rem"
              />
            </MenuButton>
            <MenuList
              bg="chocolate.900"
              border="none"
            >
              <NavigationLinks />
            </MenuList>
          </Menu>
        </Flex>
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
