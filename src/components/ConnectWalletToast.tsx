import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useWeb3Provider } from '../contexts/web3Data/hooks/useWeb3Provider';
import { TextButton } from './ui/forms/Button';

function ToastContent({ label }: { label: string }) {
  const { connect } = useWeb3Provider();
  const { t } = useTranslation('menu');
  return (
    <div className="flex flex-col items-center">
      <div>{label}</div>
      <TextButton
        label={t('connectWallet')}
        onClick={connect}
      />
    </div>
  );
}

function ConnectWalletToast({ label }: { label: string }) {
  const {
    state: { account },
  } = useWeb3Provider();
  useEffect(() => {
    if (account) {
      return;
    }

    const toastId = toast(<ToastContent label={label} />, {
      autoClose: false,
      closeOnClick: false,
      draggable: false,
      progress: 1,
      toastId: 'connectWalletToast:' + label,
    });

    return () => toast.dismiss(toastId);
  }, [account, label]);

  return null;
}

export default ConnectWalletToast;
