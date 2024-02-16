import { useEnsAvatar } from 'wagmi';
import { useEthersProvider } from './useEthersProvider';

const useAvatar = (account: string | undefined) => {
  const provider = useEthersProvider();
  const networkId = provider.network.chainId;
  const { data: avatarURL } = useEnsAvatar({
    name: account,
    chainId: networkId,
  });

  return avatarURL;
};

export default useAvatar;
