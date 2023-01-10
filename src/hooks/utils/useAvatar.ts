import { useEffect, useState } from 'react';
import { useProvider } from 'wagmi';
import { logError } from '../../helpers/errorLogging';
import useENSName from './useENSName';

const useAvatar = (account: string | null) => {
  const provider = useProvider();
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
