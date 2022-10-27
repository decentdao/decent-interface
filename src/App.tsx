import { useLocalStorage } from './hooks/useLocalStorage';
import './i18n';
import { Box, Container, Grid, GridItem } from '@chakra-ui/react';
import { useActionToast } from './hooks/toasts/useActionToast';
import Header from './components/ui/Header';
import Sidebar from './components/ui/Sidebar';
import FractalRoutes from './routes/FractalRoutes';

function App() {
  const [notAuditedAcceptance, setNotAuditedAcceptance] = useLocalStorage(
    'not_audited_acceptance',
    false
  );

  useActionToast({
    toastId: 'audit:toast',
    testId: 'toast-audit',
    isVisible: !notAuditedAcceptance,
    titleTranslationKey: 'auditDisclaimer',
    buttonTranslationKey: 'accept',
    buttonOnClick: () => setNotAuditedAcceptance(true),
  });
  return (
    <Grid
      templateAreas={`"nav header"
      "nav main"
      "nav main"`}
      gridTemplateColumns={'4.25rem 1fr'}
      gridTemplateRows="4rem minmax(calc(100vh - 4rem), 100%) 1fr"
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
