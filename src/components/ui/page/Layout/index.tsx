import { Box, Container, Grid, GridItem, Show, Text, keyframes } from '@chakra-ui/react';
import { useRef } from 'react';
import { Outlet } from 'react-router-dom';
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

const slideDownAnim = `${keyframes`
  0% {
    transform: translateY(-100%);
  }
  100% {
    transform: translateY(0);
  }
`} 0.5s ease-out`;

export function Layout() {
  const headerContainerRef = useRef<HTMLDivElement>(null);

  const HEADER_HEIGHT = useHeaderHeight();
  const CONTENT_HEIGHT = useContentHeight();
  const FOOTER_HEIGHT = useFooterHeight();

  useNavigationScrollReset();

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
        <Box
          bg="lilac--2"
          textAlign="center"
          py={3}
          position="fixed"
          w="full"
          zIndex="2"
          fontWeight="bold"
          transformOrigin="top"
          animation={slideDownAnim}
        >
          <Text>decent is currently down. We are working to restore services soon.</Text>
        </Box>
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
          mt="40px"
          animation={slideDownAnim}
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
          top={`calc(${HEADER_HEIGHT} + 40px)`}
          minHeight={{ base: undefined, md: `calc(100vh - ${HEADER_HEIGHT} - 40px)` }}
        >
          <NavigationLinks />
        </GridItem>
      </Show>
      <GridItem
        area="main"
        mx={{ base: '0.5rem', md: '1.5rem' }}
        mt="40px"
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
