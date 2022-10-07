import { useGovenorModule } from './../providers/govenor/hooks/useGovenorModule';
import { useWeb3Provider } from './../contexts/web3Data/hooks/useWeb3Provider';
import { useCallback, useEffect } from 'react';
import { useTransaction } from '../contexts/web3Data/transactions';
import { useTranslation } from 'react-i18next';

const useClaimToken = ({
  setPending,
}: {
  setPending: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const {
    state: { signerOrProvider, account },
  } = useWeb3Provider();

  const { claimModuleContract } = useGovenorModule();

  const [contractCallClaimToken, contractCallPending] = useTransaction();

  useEffect(() => {
    setPending(contractCallPending);
  }, [setPending, contractCallPending]);

  const { t } = useTranslation('transaction');

  const claimToken = useCallback(() => {
    if (!signerOrProvider || !account || !claimModuleContract) {
      return;
    }

    contractCallClaimToken({
      contractFn: () => claimModuleContract.claimSnap(account),
      pendingMessage: t('pendingClaimTokens'),
      failedMessage: t('failedClaimTokens'),
      successMessage: t('successClaimTokens'),
    });
  }, [contractCallClaimToken, claimModuleContract, signerOrProvider, account, t]);
  return claimToken;
};

export default useClaimToken;
