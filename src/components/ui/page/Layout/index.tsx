import { Box, Container, Flex, Grid, GridItem, Show, Text } from '@chakra-ui/react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation } from 'react-router-dom';
import {
  MAX_CONTENT_WIDTH,
  SIDEBAR_WIDTH,
  useContentHeight,
  useFooterHeight,
  useHeaderHeight,
} from '../../../../constants/common';
import { DAO_ROUTES } from '../../../../constants/routes';
import useNavigationScrollReset from '../../../../hooks/utils/useNavigationScrollReset';
import { HatsLogoIcon, SablierLogoIcon, VectorLogoIcon } from '../../icons/Icons';
import { ErrorBoundary } from '../../utils/ErrorBoundary';
import { TopErrorFallback } from '../../utils/TopErrorFallback';
import { Footer } from '../Footer';
import Header from '../Header';
import { NavigationLinks } from '../Navigation/NavigationLinks';

export default function Layout() {
  const { t } = useTranslation('common');
  const { pathname } = useLocation();
  const headerContainerRef = useRef<HTMLDivElement>(null);

  const HEADER_HEIGHT = useHeaderHeight();
  const CONTENT_HEIGHT = useContentHeight();
  const FOOTER_HEIGHT = useFooterHeight();

  const isRolesPage = pathname === `/${DAO_ROUTES.roles.path}`;

  useNavigationScrollReset();

  return (
    <Grid
      templateAreas={{
        base: isRolesPage
          ? `"header header"
              "main main"
              "footer footer"`
          : `"header header"
               "main main"`,
        md: `"header header"
             "nav main"
             "footer footer"`,
      }}
      gridTemplateColumns={`${SIDEBAR_WIDTH} 1fr`}
      gridTemplateRows={{
        base: `${HEADER_HEIGHT} 100%`,
        md: `${HEADER_HEIGHT} minmax(${CONTENT_HEIGHT}, 100%) ${FOOTER_HEIGHT}`,
      }}
      position="relative"
    >
      <GridItem
        area="header"
        ref={headerContainerRef}
      >
        <Box
          bg="neutral-2"
          boxShadow="0px 1px 0px 0px #161219"
          position="fixed"
          w="full"
          maxW="100vw"
          zIndex="1"
        >
          <Header headerContainerRef={headerContainerRef} />
        </Box>
      </GridItem>
      <Show above="md">
        <GridItem
          area="nav"
          zIndex="modal"
          display="flex"
          flexDirection="column"
          position="fixed"
          ml={6}
          top={HEADER_HEIGHT}
          minHeight={{ base: undefined, md: `calc(100vh - ${HEADER_HEIGHT})` }}
        >
          <NavigationLinks />
        </GridItem>
      </Show>
      <GridItem
        area="main"
        mx={{ base: '0.5rem', md: '1.5rem' }}
      >
        <Container
          maxWidth={MAX_CONTENT_WIDTH}
          mb="2rem"
        >
          <ErrorBoundary
            fallback={<TopErrorFallback />}
            showDialog
          >
            <Outlet />
          </ErrorBoundary>
        </Container>
      </GridItem>
      <Show above="md">
        <GridItem
          area="footer"
          pt="1rem"
        >
          <Footer />
        </GridItem>
      </Show>
      {isRolesPage && (
        <Show below="md">
          <GridItem
            area="footer"
            pt="1rem"
            pb="2rem"
            px="1rem"
          >
            <Flex
              gap="1rem"
              color="neutral-6"
              alignItems="center"
            >
              <Text
                fontSize="18px"
                lineHeight="20px"
                fontWeight={450}
                letterSpacing="-0.54px"
              >
                {t('poweredBy', { ns: 'common' })}
              </Text>
              <HatsLogoIcon
                width="36.201px"
                height="13.107px"
              />
              <VectorLogoIcon
                width="12.953px"
                height="12.953px"
              />
              <SablierLogoIcon
                width="50.741px"
                height="13px"
              />
            </Flex>
          </GridItem>
        </Show>
      )}
    </Grid>
  );
}
