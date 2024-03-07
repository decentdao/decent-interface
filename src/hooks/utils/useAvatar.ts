import { useEnsAvatar, usePublicClient } from 'wagmi';

const useAvatar = (account: string | null) => {
  const { chain } = usePublicClient();
  const { data: avatarURL } = useEnsAvatar({
    name: account,
    chainId: chain.id,
  });

  return avatarURL;
};

export default useAvatar;
