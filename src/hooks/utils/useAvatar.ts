import { useEffect, useState } from 'react';
import { logError } from '../../helpers/errorLogging';
import { useWeb3Provider } from '../../providers/Web3Data/hooks/useWeb3Provider';
import useENSName from './useENSName';

const useAvatar = (account: string | null) => {
  const {
    state: { provider },
  } = useWeb3Provider();
  const ensName = useENSName(account);

  const [avatarURL, setAvatarURL] = useState<string | null>(null);
  useEffect(() => {
    if (!provider || !ensName) {
      setAvatarURL(null);
      return;
    }

    provider.getAvatar(ensName).then(setAvatarURL).catch(logError);
  }, [ensName, provider]);

  return avatarURL;
};

export default useAvatar;
