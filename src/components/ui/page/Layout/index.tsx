import { Box, Container, Grid, GridItem, Show } from '@chakra-ui/react';
import { useRef } from 'react';
import { Outlet } from 'react-router-dom';
import {
  useContentHeight,
  useHeaderHeight,
  SIDEBAR_WIDTH,
  MAX_CONTENT_WIDTH,
} from '../../../../constants/common';
import { ErrorBoundary } from '../../utils/ErrorBoundary';
import { TopErrorFallback } from '../../utils/TopErrorFallback';
import { Footer } from '../Footer';
import Header from '../Header';
import { NavigationLinks } from '../Navigation/NavigationLinks';

export default function Layout() {
  const headerContainerRef = useRef<HTMLDivElement>(null);

  const HEADER_HEIGHT = useHeaderHeight();
  const CONTENT_HEIGHT = useContentHeight();

  return (
    <Grid
      templateAreas={{
        base: `"header header"
               "main main"
               "footer footer"`,
        md: `"header header"
             "nav main"
             "footer footer"`,
      }}
      gridTemplateColumns={`${SIDEBAR_WIDTH} 1fr`}
      gridTemplateRows={`${HEADER_HEIGHT} minmax(${CONTENT_HEIGHT}, 100%)`}
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
        <Show above="md">
          <NavigationLinks />
        </Show>
      </GridItem>
      <GridItem area="main">
        <Container
          maxWidth={MAX_CONTENT_WIDTH}
          minH={CONTENT_HEIGHT}
        >
          <ErrorBoundary
            fallback={<TopErrorFallback />}
            showDialog
          >
            <Outlet />
          </ErrorBoundary>
        </Container>
      </GridItem>
      <GridItem
        area="footer"
        pt="3rem"
        pb={{ base: '5rem', md: '3rem' }}
      >
        <Footer />
      </GridItem>
    </Grid>
  );
}
