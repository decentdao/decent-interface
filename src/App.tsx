import { useLocalStorage } from './hooks/useLocalStorage';
import './i18n';
import { Box, Grid, GridItem } from '@chakra-ui/react';
import { useActionToast } from './hooks/toasts/useActionToast';
import Header from './components/ui/Header';
import Sidebar from './components/ui/Sidebar';

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
      gridTemplateRows={['minmax(4rem, 100%) repeat(2, calc(100% - 100% +))', '100vh']}
    >
      <GridItem
        area={'nav'}
        display="flex"
        flexDirection="column"
        flexGrow="1"
        bg="chocolate.900"
      >
        <Sidebar />
      </GridItem>
      <GridItem area={'header'}>
        <Box
          as="header"
          bg="chocolate.900"
          h="4rem"
        >
          <Header />
        </Box>
      </GridItem>
      <GridItem area={'main'}>
        <Box>{/* Main */}</Box>
      </GridItem>
    </Grid>
  );
}

export default App;
