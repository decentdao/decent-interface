import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
  const [contractCallCastFreeze, contractCallPending] = useTransaction();
  const {
    guardContracts: { freezeVotingContractAddress, freezeVotingType },
    node: {
      nodeHierarchy: { parentAddress },
    },
  } = useFractal();
  const baseContracts = useSafeContracts();
  const { getUserERC721VotingTokens } = useUserERC721VotingTokens(undefined, undefined, false);

  useEffect(() => {
    setPending(contractCallPending);
  }, [setPending, contractCallPending]);

  const { t } = useTranslation('transaction');

  const castFreezeVote = useCallback(() => {
    if (!freezeVotingContractAddress || !baseContracts) return;
    contractCallCastFreeze({
      contractFn: () => {
        if (freezeVotingType === FreezeVotingType.ERC721) {
          const freezeERC721VotingContract =
            baseContracts.freezeERC721VotingMasterCopyContract.asSigner;
          return getUserERC721VotingTokens(undefined, parentAddress).then(tokensInfo =>
            freezeERC721VotingContract['castFreezeVote(address[],uint256[])'](
              tokensInfo.totalVotingTokenAddresses,
              tokensInfo.totalVotingTokenIds,
            ),
          );
        } else {
          const freezeVotingContract =
            baseContracts.freezeMultisigVotingMasterCopyContract.asSigner;
          return freezeVotingContract.castFreezeVote();
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
  ]);
  return castFreezeVote;
};

export default useCastFreezeVote;
