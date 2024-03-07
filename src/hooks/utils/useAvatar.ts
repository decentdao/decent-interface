import { useEnsAvatar } from 'wagmi';
import { useEthersProvider } from '../../providers/Ethers/hooks/useEthersProvider';

const useAvatar = (account: string | null) => {
  const provider = useEthersProvider();
  const networkId = provider.network.chainId;
  const { data: avatarURL } = useEnsAvatar({
    name: account,
    chainId: networkId,
  });

  return avatarURL;
};

export default useAvatar;
