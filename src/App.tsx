import { useLocalStorage } from './hooks/useLocalStorage';
import './i18n';
import { Box, Grid, GridItem } from '@chakra-ui/react';
import { useActionToast } from './hooks/toasts/useActionToast';
import Header from './components/ui/Header';

function App() {
  const [notAuditedAcceptance, setNotAuditedAcceptance] = useLocalStorage(
    'not_audited_acceptance',
    false
  );

  useActionToast({
    toastId: 'audit:toast',
    testId: 'audit:accept',
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
      gridTemplateRows={'1fr'}
    >
      <GridItem
        area={'nav'}
        minH="100vh"
      >
        <Box
          bg="chocolate.900"
          minH="100vh"
        >
          {/* Sidabar navigation */}
        </Box>
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
        <Box
          w="full"
          minH={'calc(100vh - 4rem)'}
        >
          {/* Main */}
        </Box>
      </GridItem>
    </Grid>
  );
}

export default App;
