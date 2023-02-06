import { Address, useEnsAvatar, useProvider } from 'wagmi';

const useAvatar = (account: string | null) => {
  const provider = useProvider();
  const networkId = provider.network.chainId;
  const { data: avatarURL } = useEnsAvatar({
    address: account as Address,
    chainId: networkId,
  });

  return avatarURL;
};

export default useAvatar;
