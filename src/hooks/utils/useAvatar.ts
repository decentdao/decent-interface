import { useEnsAvatar } from 'wagmi';
import { useNetworkConfigStore } from '../../providers/NetworkConfig/useNetworkConfigStore';

const useAvatar = (name: string) => {
  const { chain } = useNetworkConfigStore();
  const { data: avatarURL } = useEnsAvatar({
    name,
    chainId: chain.id,
  });

  return avatarURL;
};

export default useAvatar;
