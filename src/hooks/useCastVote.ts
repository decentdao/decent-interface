import { BigNumber } from 'ethers';
import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTransaction } from '../contexts/web3Data/transactions';
import { useWeb3Provider } from './../contexts/web3Data/hooks/useWeb3Provider';
import { useGovenorModule } from './../providers/govenor/hooks/useGovenorModule';

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
