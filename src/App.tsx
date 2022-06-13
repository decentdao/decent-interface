import { useEffect } from 'react';
import { toast } from 'react-toastify';

import Body from './components/Body';
import Breadcrumbs from './components/Breadcrumbs';
import Header from './components/ui/Header';
import { TextButton } from './components/ui/forms/Button';
import { useLocalStorage } from './hooks/useLocalStorage';

function NotAuditedToast() {
  const [notAuditedAcceptance, setNotAuditedAcceptance] = useLocalStorage(
    'not_audited_acceptance',
    false
  );

  useEffect(() => {
    if (notAuditedAcceptance) {
      return;
    }

    const toastId = toast(
      <div className="flex flex-col items-center">
        <div>WARNING: this project is not audited, use at your own risk.</div>
        <TextButton
          label="Accept"
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
  }, [notAuditedAcceptance, setNotAuditedAcceptance]);

  return null;
}

function App() {
  return (
    <>
      <NotAuditedToast />
      <div className="flex flex-col min-h-screen font-medium">
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
