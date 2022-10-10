import { useGovenorModule } from './../providers/govenor/hooks/useGovenorModule';
import { useWeb3Provider } from './../contexts/web3Data/hooks/useWeb3Provider';
import { useCallback, useEffect } from 'react';
import { useTransaction } from '../contexts/web3Data/transactions';
import { BigNumber } from 'ethers';
import { useTranslation } from 'react-i18next';

const useCastVote = ({
  proposalId,
  vote,
  setPending,
}: {
  proposalId: BigNumber | undefined;
  vote: number | undefined;
  setPending: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const {
    state: { signerOrProvider },
  } = useWeb3Provider();
  const { governorModuleContract } = useGovenorModule();

  const [contractCallCastVote, contractCallPending] = useTransaction();

  useEffect(() => {
    setPending(contractCallPending);
  }, [setPending, contractCallPending]);

  const { t } = useTranslation('transaction');

  const castVote = useCallback(() => {
    if (
      !signerOrProvider ||
      governorModuleContract === undefined ||
      proposalId === undefined ||
      vote === undefined
    ) {
      return;
    }

    contractCallCastVote({
      contractFn: () => governorModuleContract.castVote(proposalId, vote),
      pendingMessage: t('pendingCastVote'),
      failedMessage: t('failedCastVote'),
      successMessage: t('successCastVote'),
    });
  }, [contractCallCastVote, governorModuleContract, proposalId, signerOrProvider, vote, t]);
  return castVote;
};

export default useCastVote;
