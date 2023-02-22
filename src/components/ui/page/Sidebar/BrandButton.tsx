import { Flex, Hide } from '@chakra-ui/react';
import { FractalBrand, FractalBrandBurger } from '@decent-org/fractal-ui';
import { t } from 'i18next';
import { Link } from 'react-router-dom';
import { BASE_ROUTES } from '../../../../routes/constants';

export function BrandButton() {
  return (
    <>
      <Hide above="md">
        <Flex
          boxSize="4rem"
          justifyContent="center"
          alignItems="center"
        >
          <FractalBrandBurger
            aria-hidden
            boxSize="2rem"
          />
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
    </>
  );
}
