'use client';

import { ethers } from 'ethers';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import { useAccount, useProvider } from 'wagmi';
import DaoCreator from '../../src/components/DaoCreator';
import { DAO_ROUTES } from '../../src/constants/routes';
import { useAccountFavorites } from '../../src/hooks/DAO/loaders/useFavorites';
import useDeployDAO from '../../src/hooks/DAO/useDeployDAO';
import { useAsyncRetry } from '../../src/hooks/utils/useAsyncRetry';
import { useFractal } from '../../src/providers/App/AppProvider';
import { GnosisDAO, TokenGovernanceDAO } from '../../src/types';

export default function DaoCreatePage() {
  const { push } = useRouter();
  const provider = useProvider();
  const { address: account } = useAccount();
  const { requestWithRetries } = useAsyncRetry();
  const {
    clients: { safeService },
  } = useFractal();
  const { toggleFavorite } = useAccountFavorites();
  const [redirectPending, setRedirectPending] = useState(false);

  const successCallback = useCallback(
    async (daoAddress: string) => {
      if (!safeService) return;
      setRedirectPending(true);
      const { getAddress } = ethers.utils;
      const daoFound = await requestWithRetries(
        () => safeService.getSafeCreationInfo(getAddress(daoAddress)),
        5
      );
      if (daoFound) {
        toggleFavorite(daoAddress);
        push(DAO_ROUTES.dao.relative(daoAddress));
      } else {
        toast('DAO NOT FOUND', { autoClose: false });
        setRedirectPending(false);
      }
    },
    [safeService, requestWithRetries, toggleFavorite, push]
  );

  const [deploy, pending] = useDeployDAO();

  const deployDAO = (daoData: GnosisDAO | TokenGovernanceDAO) => {
    deploy(daoData, successCallback);
  };

  return (
    <DaoCreator
      pending={pending || redirectPending}
      deployDAO={() => {
        toast(account);
        if (account) {
          console.log('ASODIHASODHAS', provider.getBalance(account));
          push(DAO_ROUTES.dao.relative('0x'));
        }
      }}
    />
  );
}
