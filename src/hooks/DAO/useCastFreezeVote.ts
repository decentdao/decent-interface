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
import useAddressERC721VotingTokens from './proposal/useAddressERC721VotingTokens';

const useCastFreezeVote = ({
  setPending,
}: {
  setPending: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [contractCallCastFreeze, contractCallPending] = useTransaction();
  const {
    guardContracts: { freezeVotingContract, freezeVotingType },
    readOnly: { user },
    node: {
      nodeHierarchy: { parentAddress },
    },
  } = useFractal();
  const { totalVotingTokenAddresses, totalVotingTokenIds } = useAddressERC721VotingTokens(
    undefined,
    user.address,
    parentAddress
  );

  useEffect(() => {
    setPending(contractCallPending);
  }, [setPending, contractCallPending]);

  const { t } = useTranslation('transaction');

  const castFreezeVote = useCallback(() => {
    contractCallCastFreeze({
      contractFn: () => {
        if (freezeVotingType === FreezeVotingType.ERC721) {
          return (freezeVotingContract?.asSigner as ERC721FreezeVoting)[
            'castFreezeVote(address[],uint256[])'
          ](totalVotingTokenAddresses, totalVotingTokenIds);
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
    totalVotingTokenAddresses,
    totalVotingTokenIds,
  ]);
  return castFreezeVote;
};

export default useCastFreezeVote;
