import { useEffect } from 'react';
import { toast } from 'react-toastify';

import Body from './components/Body';
import Breadcrumbs from './components/Breadcrumbs';
import Header from './components/ui/Header';
import { TextButton } from './components/ui/forms/Button';
import { useLocalStorage } from './hooks/useLocalStorage';
import './i18n';
import { useTranslation } from 'react-i18next';

function NotAuditedToast() {
  const [notAuditedAcceptance, setNotAuditedAcceptance] = useLocalStorage(
    'not_audited_acceptance',
    false
  );

  const { t } = useTranslation();

  useEffect(() => {
    if (notAuditedAcceptance) {
      return;
    }

    const toastId = toast(
      <div className="flex flex-col items-center">
        <div>{t('auditDisclaimer')}</div>
        <TextButton
          label={t('accept')}
          onClick={() => setNotAuditedAcceptance(true)}
        />
      </div>,
      {
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        progress: 1,
      }
    );

    return () => toast.dismiss(toastId);
  }, [notAuditedAcceptance, setNotAuditedAcceptance, t]);

  return null;
}

function App() {
  return (
    <>
      <NotAuditedToast />
      <div className="flex flex-col min-h-screen font-medium text-gray-25">
        <Header />
        <main className="flex-grow bg-fixed bg-image-pattern bg-cover">
          <Breadcrumbs />
          <div className="container pt-20 pb-10">
            <div className="max-w-4xl mx-auto">
              <Body />
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export default App;
