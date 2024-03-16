import { Flex, Text, Button } from '@chakra-ui/react';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useFractal } from '../../../providers/App/AppProvider';

function ToastContent({ label }: { label: string }) {
  const { open } = useWeb3Modal();
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
        onClick={() => open()}
      >
        {t('connectWallet')}
      </Button>
    </Flex>
  );
}

function ConnectWalletToast({ label }: { label: string }) {
  const {
    readOnly: { user },
  } = useFractal();
  useEffect(() => {
    if (user.address) {
      return;
    }

    const toastId = toast(<ToastContent label={label} />, {
      autoClose: false,
      closeOnClick: false,
      draggable: false,
      progress: 1,
    });

    return () => toast.dismiss(toastId);
  }, [user.address, label]);

  return null;
}

export default ConnectWalletToast;
