import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getContract } from 'viem';
import { useFractal } from '../../providers/App/AppProvider';
import { FreezeVotingType } from '../../types';
import useSafeContracts from '../safe/useSafeContracts';
import useContractClient from '../utils/useContractClient';
import { useTransaction } from '../utils/useTransaction';
import useUserERC721VotingTokens from './proposal/useUserERC721VotingTokens';

const useCastFreezeVote = ({
  setPending,
}: {
  setPending: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [contractCallCastFreeze, contractCallPending] = useTransaction();
  const {
    guardContracts: { freezeVotingContractAddress, freezeVotingType },
    node: {
      nodeHierarchy: { parentAddress },
    },
  } = useFractal();
  const baseContracts = useSafeContracts();
  const { getUserERC721VotingTokens } = useUserERC721VotingTokens(undefined, undefined, false);
  const { walletClient } = useContractClient();

  useEffect(() => {
    setPending(contractCallPending);
  }, [setPending, contractCallPending]);

  const { t } = useTranslation('transaction');

  const castFreezeVote = useCallback(() => {
    if (!freezeVotingContractAddress || !baseContracts || !walletClient) return;
    contractCallCastFreeze({
      contractFn: () => {
        if (freezeVotingType === FreezeVotingType.ERC721) {
          const freezeERC721VotingContract = getContract({
            address: freezeVotingContractAddress,
            abi: baseContracts.freezeERC721VotingMasterCopyContract?.asWallet.abi!,
            client: walletClient,
          });
          return getUserERC721VotingTokens(undefined, parentAddress).then(tokensInfo =>
            freezeERC721VotingContract.write['castFreezeVote(address[],uint256[])']([
              tokensInfo.totalVotingTokenAddresses,
              tokensInfo.totalVotingTokenIds,
            ]),
          );
        } else {
          const freezeVotingContract = getContract({
            address: freezeVotingContractAddress,
            abi: baseContracts.freezeERC20VotingMasterCopyContract.asWallet.abi,
            client: walletClient,
          });
          return freezeVotingContract.write.castFreezeVote([]);
        }
      },
      pendingMessage: t('pendingCastFreezeVote'),
      failedMessage: t('failedCastFreezeVote'),
      successMessage: t('successCastFreezeVote'),
    });
  }, [
    contractCallCastFreeze,
    t,
    freezeVotingContractAddress,
    freezeVotingType,
    getUserERC721VotingTokens,
    parentAddress,
    baseContracts,
    walletClient,
  ]);
  return castFreezeVote;
};

export default useCastFreezeVote;
