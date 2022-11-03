import { useWeb3Provider } from '../../../contexts/web3Data/hooks/useWeb3Provider';
import { useCallback, useEffect } from 'react';
import { useTransaction } from '../../../contexts/web3Data/transactions';
import { BigNumber } from 'ethers';
import { useTranslation } from 'react-i18next';
import useUsul from './useUsul';
import { OZLinearVoting__factory } from '../../../assets/typechain-types/usul';

const useCastVote = ({
  proposalNumber,
  vote,
  setPending,
}: {
  proposalNumber: BigNumber;
  vote: number | undefined;
  setPending: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { votingStrategiesAddresses } = useUsul();
  const {
    state: { signerOrProvider },
  } = useWeb3Provider();

  const [contractCallCastVote, contractCallPending] = useTransaction();

  useEffect(() => {
    setPending(contractCallPending);
  }, [setPending, contractCallPending]);

  const { t } = useTranslation('transaction');

  const castVote = useCallback(() => {
    if (
      !signerOrProvider ||
      proposalNumber === undefined ||
      vote === undefined ||
      !votingStrategiesAddresses[0]
    ) {
      return;
    }

    const votingStrategyContract = OZLinearVoting__factory.connect(
      votingStrategiesAddresses[0],
      signerOrProvider
    );

    contractCallCastVote({
      contractFn: () => votingStrategyContract.vote(proposalNumber, vote, '0x'),
      pendingMessage: t('pendingCastVote'),
      failedMessage: t('failedCastVote'),
      successMessage: t('successCastVote'),
    });
  }, [contractCallCastVote, proposalNumber, signerOrProvider, vote, t, votingStrategiesAddresses]);
  return castVote;
};

export default useCastVote;
