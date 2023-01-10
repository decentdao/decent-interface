import { OZLinearVoting__factory } from '@fractal-framework/fractal-contracts';
import { BigNumber } from 'ethers';
import { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useProvider, useSigner } from 'wagmi';
import { useTransaction } from '../../../providers/Web3Data/transactions';
import useUsul from './useUsul';

const useCastVote = ({
  proposalNumber,
  setPending,
}: {
  proposalNumber: BigNumber;
  setPending: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { votingStrategiesAddresses } = useUsul();
  const provider = useProvider();
  const { data } = useSigner();
  const signerOrProvider = useMemo(() => data || provider, [data, provider]);

  const [contractCallCastVote, contractCallPending] = useTransaction();

  useEffect(() => {
    setPending(contractCallPending);
  }, [setPending, contractCallPending]);

  const { t } = useTranslation('transaction');

  const castVote = useCallback(
    (vote: number) => {
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
    },
    [contractCallCastVote, proposalNumber, signerOrProvider, t, votingStrategiesAddresses]
  );
  return castVote;
};

export default useCastVote;
