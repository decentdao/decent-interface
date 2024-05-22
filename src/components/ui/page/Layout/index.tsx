import { Box, Container, Grid, GridItem, Show } from '@chakra-ui/react';
import { useRef } from 'react';
import { Outlet } from 'react-router-dom';
import {
  CONTENT_HEIGHT,
  HEADER_HEIGHT,
  SIDEBAR_WIDTH,
  MAX_CONTENT_WIDTH,
} from '../../../../constants/common';
import { useFractal } from '../../../../providers/App/AppProvider';
import { ErrorBoundary } from '../../utils/ErrorBoundary';
import { TopErrorFallback } from '../../utils/TopErrorFallback';
import { Footer } from '../Footer';
import Header from '../Header';
import { NavigationLinks } from '../Navigation/NavigationLinks';

export default function Layout() {
  const {
    node: { daoAddress },
  } = useFractal();
  const headerContainerRef = useRef<HTMLDivElement>(null);

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
        top={`${HEADER_HEIGHT}`}
        minHeight={{ base: undefined, md: `calc(100vh - ${HEADER_HEIGHT})` }}
      >
        <Show above="md">
          <NavigationLinks
            showDAOLinks={!!daoAddress}
            address={daoAddress}
          />
        </Show>
      </GridItem>
      <GridItem
        area="main"
        mx="1.5rem"
      >
        <Container
          display="grid"
          maxWidth={MAX_CONTENT_WIDTH}
          px="0"
          minH={CONTENT_HEIGHT}
          paddingBottom="2rem"
        >
          <ErrorBoundary
            fallback={<TopErrorFallback />}
            showDialog
          >
            <Outlet />
          </ErrorBoundary>
        </Container>
      </GridItem>
      <GridItem area="footer">
        <Footer />
      </GridItem>
    </Grid>
  );
}
