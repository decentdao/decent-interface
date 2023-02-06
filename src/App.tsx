import { Box, Container, Grid, GridItem } from '@chakra-ui/react';
import './i18n';
import Header from './components/ui/page/Header';
import Sidebar from './components/ui/page/Sidebar';
import { CONTENT_HEIGHT, HEADER_HEIGHT } from './constants/common';
import { useActionToast } from './hooks/toasts/useActionToast';
import { useFractal } from './providers/Fractal/hooks/useFractal';
import FractalRoutes from './routes/FractalRoutes';
import { notProd, testErrorBoundary } from './utils/dev';

function localDevConfigs() {
  if (notProd()) {
    if (process.env.REACT_APP_TEST_ERROR_BOUNDARY === 'true') {
      testErrorBoundary();
    }
  }
}

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

  localDevConfigs();

  return (
    <Grid
      templateAreas={`"nav header"
      "nav main"`}
      gridTemplateColumns={'4.25rem 1fr'}
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
          <FractalRoutes />
        </Container>
      </GridItem>
      <GridItem area={'header'}>
        <Box
          as="header"
          bg="chocolate.900"
          h="4rem"
          position="fixed"
          zIndex={5}
          w="calc(100% - 4.25rem)"
        >
          <Header />
        </Box>
      </GridItem>

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
    </Grid>
  );
}

export default App;
