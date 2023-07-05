import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNetwork } from 'wagmi';
import { disconnectedChain } from '../../providers/NetworkConfig/NetworkConfigProvider';
import { useIsSafe } from '../safe/useIsSafe';
import useAddress from '../utils/useAddress';

export const useSearchDao = () => {
  const [searchString, setSearchString] = useState<string | undefined>();
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { address, isValidAddress, isAddressLoading } = useAddress(searchString);
  const { isSafe, isSafeLoading } = useIsSafe(address);
  const { t } = useTranslation('dashboard');
  const { chain } = useNetwork();

  useEffect(() => {
    setIsLoading(isAddressLoading === true || isSafeLoading === true);
  }, [isAddressLoading, isSafeLoading]);

  useEffect(() => {
    if (!searchString || isLoading) {
      setErrorMessage('');
      return;
    }

    if (isSafe) {
      setErrorMessage('');
    } else {
      if (isValidAddress) {
        setErrorMessage(
          t('errorFailedSearch', { chain: chain ? chain.name : disconnectedChain.name })
        );
      } else {
        setErrorMessage(t('errorInvalidSearch'));
      }
    }
  }, [
    address,
    isValidAddress,
    searchString,
    isSafe,
    t,
    isLoading,
    errorMessage,
    chain?.name,
    chain,
  ]);

  return {
    errorMessage,
    isLoading,
    address,
    isSafe,
    setSearchString,
    searchString,
  };
};
