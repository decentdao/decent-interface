import { Box, Container, Grid, GridItem } from '@chakra-ui/react';
import './i18n';
import Header from './components/ui/Header';
import Sidebar from './components/ui/Sidebar';
import { CONTENT_HEIGHT, HEADER_HEIGHT } from './constants/common';
import { useActionToast } from './hooks/toasts/useActionToast';
import { useFractal } from './providers/fractal/hooks/useFractal';
import FractalRoutes from './routes/FractalRoutes';

function App() {
  const {
    account: {
      audit: { hasAccepted, acceptAudit },
    },
  } = useFractal();

  useActionToast({
    toastId: 'audit:toast',
    testId: 'toast-audit',
    isVisible: hasAccepted !== undefined && !hasAccepted,
    titleTranslationKey: 'auditDisclaimer',
    buttonTranslationKey: 'accept',
    buttonOnClick: acceptAudit,
  });

  return (
    <Grid
      templateAreas={`"nav header"
      "nav main"`}
      gridTemplateColumns={'4.25rem 1fr'}
      gridTemplateRows={`${HEADER_HEIGHT} minmax(${CONTENT_HEIGHT}, 100%)`}
      position="relative"
    >
      <GridItem
        area={'nav'}
        display="flex"
        flexDirection="column"
        flexGrow="1"
        bg="chocolate.900"
        position="fixed"
        w="4.25rem"
        minHeight="100vh"
      >
        <Sidebar />
      </GridItem>
      <GridItem area={'header'}>
        <Box
          as="header"
          bg="chocolate.900"
          h="4rem"
          position="fixed"
          zIndex="sticky"
          w="calc(100% - 4.25rem)"
        >
          <Header />
        </Box>
      </GridItem>
      <GridItem area={'main'}>
        <Container
          maxWidth="container.xl"
          px="0"
        >
          <FractalRoutes />
        </Container>
      </GridItem>
    </Grid>
  );
}

export default App;
