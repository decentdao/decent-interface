import { Box, Container, Grid, GridItem, Show, Text } from '@chakra-ui/react';
import { useRef } from 'react';
import { Outlet, useMatches } from 'react-router-dom';
import {
  MAX_CONTENT_WIDTH,
  SIDEBAR_WIDTH,
  useContentHeight,
  useFooterHeight,
  useHeaderHeight,
} from '../../../../constants/common';
import useNavigationScrollReset from '../../../../hooks/utils/useNavigationScrollReset';
import { ErrorBoundary } from '../../utils/ErrorBoundary';
import { TopErrorFallback } from '../../utils/TopErrorFallback';
import { Footer } from '../Footer';
import Header from '../Header';
import { NavigationLinks } from '../Navigation/NavigationLinks';

export function Layout() {
  const headerContainerRef = useRef<HTMLDivElement>(null);

  const HEADER_HEIGHT = useHeaderHeight();
  const CONTENT_HEIGHT = useContentHeight();
  const FOOTER_HEIGHT = useFooterHeight();

  useNavigationScrollReset();

  const isReindexing = true;
  const matches = useMatches();
  const onDao = matches.some(
    _match => _match.pathname !== '/' && !_match.pathname.startsWith('/create'),
  );

  const showReindexingBanner = isReindexing && onDao;

  return (
    <Grid
      templateAreas={{
        base: `"banner banner"
               "header header"
               "main main"`,
        md: `"banner banner"
             "header header"
             "nav main"
             "footer footer"`,
      }}
      gridTemplateColumns={`${SIDEBAR_WIDTH} 1fr`}
      gridTemplateRows={{
        base: `auto ${HEADER_HEIGHT} 100%`,
        md: `auto ${HEADER_HEIGHT} minmax(${CONTENT_HEIGHT}, 100%) ${FOOTER_HEIGHT}`,
      }}
      position="relative"
    >
      <GridItem area="banner">
        {showReindexingBanner ? (
          <Box
            bg="lilac--2"
            textAlign="center"
            p={3}
            position="fixed"
            w="full"
            zIndex="2"
            fontWeight="bold"
            transformOrigin="top"
          >
            <Text>
              Decent&apos;s indexers are rebuilding. We are working to restore services soon.
            </Text>
          </Box>
        ) : null}
      </GridItem>
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
          mt={showReindexingBanner ? '48px' : '0px'}
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
          top={showReindexingBanner ? `calc(${HEADER_HEIGHT} + 48px)` : HEADER_HEIGHT}
          minHeight={{
            base: undefined,
            md: `calc(100vh - ${HEADER_HEIGHT} - ${showReindexingBanner ? '48px' : '0px'})`,
          }}
        >
          <NavigationLinks />
        </GridItem>
      </Show>
      <GridItem
        area="main"
        mx={{ base: '0.5rem', md: '1.5rem' }}
        mt={showReindexingBanner ? '48px' : '0px'}
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
    </Grid>
  );
}
