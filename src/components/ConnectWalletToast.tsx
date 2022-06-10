import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useWeb3Provider } from '../contexts/web3Data/hooks/useWeb3Provider';
import { TextButton } from './ui/forms/Button';

function ToastContent({ label }: { label: string }) {
  const { connect } = useWeb3Provider();
  return (
    <div className="flex flex-col items-center">
      <div>{label}</div>
      <TextButton
        label="Connect Wallet"
        onClick={connect}
      />
    </div>
  );
}

function ConnectWalletToast({ label }: { label: string }) {
  const {
    state: { wallet: account },
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
    });

    return () => toast.dismiss(toastId);
  }, [account, label]);

  return null;
}

export default ConnectWalletToast;
