import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getContract, getAddress } from 'viem';
import { useWalletClient } from 'wagmi';
import ERC721FreezeVotingAbi from '../../assets/abi/ERC721FreezeVoting';
import { useFractal } from '../../providers/App/AppProvider';
import { FreezeVotingType } from '../../types';
import useSafeContracts from '../safe/useSafeContracts';
import { useTransaction } from '../utils/useTransaction';
import useUserERC721VotingTokens from './proposal/useUserERC721VotingTokens';

const useCastFreezeVote = ({
  setPending,
}: {
  setPending: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [contractCallCastFreeze, contractCallPending, contractCallCastFreezeViem] =
    useTransaction();
  const {
    guardContracts: { freezeVotingContractAddress, freezeVotingType },
    node: {
      nodeHierarchy: { parentAddress },
    },
  } = useFractal();
  const baseContracts = useSafeContracts();
  const { getUserERC721VotingTokens } = useUserERC721VotingTokens(null, undefined, false);

  useEffect(() => {
    setPending(contractCallPending);
  }, [setPending, contractCallPending]);

  const { t } = useTranslation('transaction');
  const { data: walletClient } = useWalletClient();

  const castFreezeVote = useCallback(() => {
    if (!freezeVotingContractAddress) return;

    if (freezeVotingType === FreezeVotingType.ERC721) {
      if (!walletClient) return;

      contractCallCastFreezeViem({
        contractFn: () => {
          const freezeERC721VotingContract = getContract({
            abi: ERC721FreezeVotingAbi,
            address: getAddress(freezeVotingContractAddress),
            client: walletClient,
          });
          return getUserERC721VotingTokens(parentAddress, undefined).then(tokensInfo => {
            return freezeERC721VotingContract.write.castFreezeVote([
              tokensInfo.totalVotingTokenAddresses.map(a => getAddress(a)),
              tokensInfo.totalVotingTokenIds.map(i => BigInt(i)),
            ]);
          });
        },
        pendingMessage: t('pendingCastFreezeVote'),
        failedMessage: t('failedCastFreezeVote'),
        successMessage: t('successCastFreezeVote'),
      });
    } else {
      if (!baseContracts) return;

      contractCallCastFreeze({
        contractFn: () => {
          // TODO: split this out between multisig and erc20
          const freezeVotingContract =
            baseContracts.freezeMultisigVotingMasterCopyContract.asSigner.attach(
              freezeVotingContractAddress,
            );
          return freezeVotingContract.castFreezeVote();
        },

        pendingMessage: t('pendingCastFreezeVote'),
        failedMessage: t('failedCastFreezeVote'),
        successMessage: t('successCastFreezeVote'),
      });
    }
  }, [
    baseContracts,
    contractCallCastFreeze,
    contractCallCastFreezeViem,
    freezeVotingContractAddress,
    freezeVotingType,
    getUserERC721VotingTokens,
    parentAddress,
    t,
    walletClient,
  ]);
  return castFreezeVote;
};

export default useCastFreezeVote;
