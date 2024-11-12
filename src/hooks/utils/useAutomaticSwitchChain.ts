import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useSwitchChain } from 'wagmi';
import { useNetworkConfig } from '../../providers/NetworkConfig/NetworkConfigProvider';
import { getChainIdFromPrefix, getPrefixFromChainId } from '../../utils/url';

export const useAutomaticSwitchChain = ({
  addressPrefix,
}: {
  addressPrefix: string | undefined;
}) => {
  const { t } = useTranslation(['common']);
  const networkConfig = useNetworkConfig();
  const { switchChain } = useSwitchChain({
    mutation: {
      onSuccess: () => {
        window.location.reload();
      },
      onError: error => {
        if (error.name !== 'UserRejectedRequestError') {
          toast.warning(t('automaticChainSwitchingErrorMessage'));
        }
      },
    },
  });

  useEffect(() => {
    if (
      addressPrefix === undefined ||
      getPrefixFromChainId(networkConfig.chain.id) === addressPrefix
    ) {
      return;
    }

    switchChain({ chainId: getChainIdFromPrefix(addressPrefix) });
  }, [switchChain, addressPrefix, networkConfig.chain.id]);
};
