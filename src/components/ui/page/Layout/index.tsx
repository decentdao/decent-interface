import { Box, Container, Grid, GridItem, Show } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import { CONTENT_HEIGHT, HEADER_HEIGHT } from '../../../../constants/common';
import { useFractal } from '../../../../providers/App/AppProvider';
import Header from '../Header';
import { NavigationLinksSidebar } from '../Navigation/NavigationLinksSidebar';

export default function Layout() {
  const {
    node: { daoAddress },
  } = useFractal();

  return (
    <Grid
      templateAreas={{
        base: `"header header"
"main main"`,
        md: `"header header"
"nav main"`,
      }}
      gridTemplateColumns="4.25rem 1fr"
      gridTemplateRows={`${HEADER_HEIGHT} minmax(${CONTENT_HEIGHT}, 100%)`}
      position="relative"
    >
      <GridItem
        area={'main'}
        mx="1.5rem"
      >
        <Container
          display="grid"
          maxWidth="container.xl"
          px="0"
          minH={CONTENT_HEIGHT}
          paddingBottom="2rem"
        >
          <Outlet />
        </Container>
      </GridItem>
      <GridItem area={'header'}>
        <Box
          bg="#26212AD6"
          backdropFilter="blur(12px)"
          position="fixed"
          zIndex={5}
          w="full"
        >
          <Header />
        </Box>
      </GridItem>

      <GridItem
        area={'nav'}
        display="flex"
        flexDirection="column"
        position="fixed"
        ml={6}
        minHeight={{ base: undefined, md: `calc(100vh - ${HEADER_HEIGHT})` }}
      >
        <Show above="md">
          <NavigationLinksSidebar
            showDAOLinks={!!daoAddress}
            address={daoAddress}
          />
        </Show>
      </GridItem>
    </Grid>
  );
}
