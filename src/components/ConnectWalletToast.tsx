import { Flex, Text, Button } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useWeb3Provider } from '../providers/Web3Data/hooks/useWeb3Provider';

function ToastContent({ label }: { label: string }) {
  const { connect } = useWeb3Provider();
  const { t } = useTranslation('menu');
  return (
    <Flex
      flexDirection="column"
      alignItems="center"
    >
      <Text>{label}</Text>
      <Button
        size="lg"
        variant="text"
        onClick={connect}
      >
        {t('connectWallet')}
      </Button>
    </Flex>
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
    });

    return () => toast.dismiss(toastId);
  }, [account, label]);

  return null;
}

export default ConnectWalletToast;
