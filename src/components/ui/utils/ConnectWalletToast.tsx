import { Flex, Text, Button } from '@chakra-ui/react';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useAccount } from 'wagmi';

function ToastContent({ label }: { label: string }) {
  const { openConnectModal } = useConnectModal();
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
        onClick={openConnectModal}
      >
        {t('connectWallet')}
      </Button>
    </Flex>
  );
}

function ConnectWalletToast({ label }: { label: string }) {
  const { address: account } = useAccount();
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
