import {
  ERC20FreezeVoting,
  ERC721FreezeVoting,
  MultisigFreezeVoting,
} from '@fractal-framework/fractal-contracts';
import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useFractal } from '../../providers/App/AppProvider';
import { FreezeVotingType } from '../../types';
import { useTransaction } from '../utils/useTransaction';
import useUserERC721VotingTokens from './proposal/useUserERC721VotingTokens';

const useCastFreezeVote = ({
  setPending,
}: {
  setPending: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [contractCallCastFreeze, contractCallPending] = useTransaction();
  const {
    guardContracts: { freezeVotingContract, freezeVotingType },
    node: {
      nodeHierarchy: { parentAddress },
    },
  } = useFractal();
  const { getUserERC721VotingTokens } = useUserERC721VotingTokens(undefined, undefined, false);

  useEffect(() => {
    setPending(contractCallPending);
  }, [setPending, contractCallPending]);

  const { t } = useTranslation('transaction');

  const castFreezeVote = useCallback(() => {
    contractCallCastFreeze({
      contractFn: () => {
        if (freezeVotingType === FreezeVotingType.ERC721) {
          return getUserERC721VotingTokens(undefined, parentAddress).then(tokensInfo =>
            (freezeVotingContract?.asSigner as ERC721FreezeVoting)[
              'castFreezeVote(address[],uint256[])'
            ](tokensInfo.totalVotingTokenAddresses, tokensInfo.totalVotingTokenIds)
          );
        } else {
          return (
            freezeVotingContract?.asSigner as MultisigFreezeVoting | ERC20FreezeVoting
          ).castFreezeVote();
        }
      },
      pendingMessage: t('pendingCastFreezeVote'),
      failedMessage: t('failedCastFreezeVote'),
      successMessage: t('successCastFreezeVote'),
    });
  }, [
    contractCallCastFreeze,
    t,
    freezeVotingContract,
    freezeVotingType,
    getUserERC721VotingTokens,
    parentAddress,
  ]);
  return castFreezeVote;
};

export default useCastFreezeVote;
