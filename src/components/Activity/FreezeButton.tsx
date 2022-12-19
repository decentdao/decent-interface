import { Button } from '@chakra-ui/react';
import { VetoERC20Voting, VetoMultisigVoting } from '@fractal-framework/fractal-contracts';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useCastFreezeVote from '../../hooks/DAO/useCastFreezeVote';

export function FreezeButton({
  isFrozen,
  userHasFreezeVoted,
  userHasVotes,
  vetoVotingContract,
}: {
  isFrozen: boolean;
  userHasFreezeVoted: boolean;
  userHasVotes: boolean;
  vetoVotingContract: VetoERC20Voting | VetoMultisigVoting;
}) {
  const [pending, setPending] = useState<boolean>(false);
  const { t } = useTranslation(['dashboard']);
  const castFreezeVote = useCastFreezeVote({ vetoVotingContract, setPending });

  const disabled = isFrozen || userHasFreezeVoted || pending || !userHasVotes;

  return (
    <Button
      variant="ghost"
      bgColor={'black.900'}
      border="1px"
      borderColor={'blue.500'}
      textColor={'blue.500'}
      onClick={castFreezeVote}
      disabled={disabled}
    >
      {t(
        !userHasVotes ? 'noVotesButton' : userHasFreezeVoted ? 'freezeVotedButton' : 'freezeButton'
      )}
    </Button>
  );
}
