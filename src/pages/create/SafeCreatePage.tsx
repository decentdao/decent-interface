import * as amplitude from '@amplitude/analytics-browser';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Address } from 'viem';
import DaoCreator from '../../components/DaoCreator';
import { DAOCreateMode } from '../../components/DaoCreator/formComponents/EstablishEssentials';
import { BASE_ROUTES, DAO_ROUTES } from '../../constants/routes';
import { useAccountFavorites } from '../../hooks/DAO/loaders/useFavorites';
import useDeployDAO from '../../hooks/DAO/useDeployDAO';
import { useAsyncRetry } from '../../hooks/utils/useAsyncRetry';
import { analyticsEvents } from '../../insights/analyticsEvents';
import { useSafeAPI } from '../../providers/App/hooks/useSafeAPI';
import { AzoriusERC20DAO, AzoriusERC721DAO, SafeMultisigDAO } from '../../types';

export function SafeCreatePage() {
  const navigate = useNavigate();
  const { requestWithRetries } = useAsyncRetry();
  const { toggleFavorite } = useAccountFavorites();
  const [redirectPending, setRedirectPending] = useState(false);
  const { t } = useTranslation('transaction');
  const safeAPI = useSafeAPI();

  useEffect(() => {
    amplitude.track(analyticsEvents.DaoCreatePageOpened);
  }, []);

  const successCallback = useCallback(
    async (addressPrefix: string, safeAddress: Address, daoName: string) => {
      setRedirectPending(true);
      const daoFound = await requestWithRetries(
        async () => (safeAPI ? safeAPI.getSafeCreationInfo(safeAddress) : undefined),
        8,
      );
      toggleFavorite(safeAddress, daoName);
      if (daoFound) {
        navigate(DAO_ROUTES.dao.relative(addressPrefix, safeAddress));
      } else {
        toast.loading(t('failedIndexSafe'), { dismissible: true });
        navigate(BASE_ROUTES.landing);
      }
    },
    [safeAPI, requestWithRetries, toggleFavorite, navigate, t],
  );

  const [deploy, pending] = useDeployDAO();

  return (
    <DaoCreator
      pending={pending || redirectPending}
      deployDAO={(daoData: SafeMultisigDAO | AzoriusERC20DAO | AzoriusERC721DAO) => {
        deploy(daoData, successCallback);
      }}
      mode={DAOCreateMode.ROOTDAO}
    />
  );
}
