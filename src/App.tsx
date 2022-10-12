import { useLocalStorage } from './hooks/useLocalStorage';
import './i18n';
import { Flex } from '@chakra-ui/react';
import { ActionToast } from './components/ui/toasts/ActionToast';

function App() {
  const [notAuditedAcceptance, setNotAuditedAcceptance] = useLocalStorage(
    'not_audited_acceptance',
    false
  );
  return (
    <Flex
      flexDirection="column"
      minHeight="h-screen"
    >
      <ActionToast
        testId="audit:accept"
        isVisible={!notAuditedAcceptance}
        titleTranslationKey="auditDisclaimer"
        buttonTranslationKey="accept"
        buttonOnClick={() => setNotAuditedAcceptance(true)}
      />
    </Flex>
  );
}

export default App;
