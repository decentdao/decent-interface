import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useCastVote from '../../hooks/useCastVote';
import { ProposalData, ProposalState } from '../../providers/govenor/types';
import ContentBanner from '../ui/ContentBanner';
import { PrimaryButton, SecondaryButton } from '../ui/forms/Button';
import Check from '../ui/svg/Check';

function CastVote({ proposal }: { proposal: ProposalData }) {
  // Vote Enum
  // Against => 0
  // For => 1
  // Abstain => 2
  const [newVote, setNewVote] = useState<number>();
  const [voteButtonString, setVoteButtonString] = useState<string>();
  const [pending, setPending] = useState<boolean>(false);
  const { t } = useTranslation('proposal');

  useEffect(() => {
    if (proposal.state !== ProposalState.Active) {
      setVoteButtonString(t('labelVotingClosed'));
    } else if (proposal.userVote !== undefined) {
      setVoteButtonString(t('labelAlreadyVoted'));
    } else if (proposal.userVotePower === undefined || proposal.userVotePower.eq(0)) {
      setVoteButtonString(t('labelNoVotes'));
    } else {
      setVoteButtonString(t('labelCastVote'));
    }
  }, [proposal, t]);

  const castVote = useCastVote({
    proposalId: proposal.id,
    vote: newVote,
    setPending: setPending,
  });

  function NoSelected() {
    return newVote === 0 || proposal.userVote === 0 ? <Check /> : null;
  }
  function YesSelected() {
    return newVote === 1 || proposal.userVote === 1 ? <Check /> : null;
  }
  function AbstainedSelected() {
    return newVote === 2 || proposal.userVote === 2 ? <Check /> : null;
  }
  return (
    <>
      <div className="flex flex-col bg-gray-600 my-2 p-2 pb-4 w-3/5 rounded-md">
        <div className="flex mx-2 my-2 text-gray-25 text-lg font-semibold">Cast Vote</div>
        <hr className="mx-2 mb-6 border-gray-200" />
        <div className="flex flex-col gap-4">
          <SecondaryButton
            onClick={() => setNewVote(1)}
            icon={<YesSelected />}
            disabled={
              proposal.state !== ProposalState.Active ||
              proposal.userVote !== undefined ||
              proposal.userVotePower === undefined ||
              proposal.userVotePower.eq(0) ||
              pending
            }
            label={t('labelVoteYes')}
            isIconRight
            isSpaceBetween
            isLarge
          />
          <SecondaryButton
            onClick={() => setNewVote(0)}
            icon={<NoSelected />}
            disabled={
              proposal.state !== ProposalState.Active ||
              proposal.userVote !== undefined ||
              proposal.userVotePower === undefined ||
              proposal.userVotePower.eq(0) ||
              pending
            }
            label={t('labelVoteNo')}
            isIconRight
            isSpaceBetween
            isLarge
          />
          <SecondaryButton
            onClick={() => setNewVote(2)}
            icon={<AbstainedSelected />}
            disabled={
              proposal.state !== ProposalState.Active ||
              proposal.userVote !== undefined ||
              proposal.userVotePower === undefined ||
              proposal.userVotePower.eq(0) ||
              pending
            }
            label={t('labelAbstain')}
            isIconRight
            isSpaceBetween
            isLarge
          />
          <PrimaryButton
            className="mt-4"
            onClick={() => castVote()}
            disabled={
              newVote === undefined ||
              proposal.state !== ProposalState.Active ||
              proposal.userVote !== undefined ||
              proposal.userVotePower === undefined ||
              proposal.userVotePower.eq(0) ||
              pending
            }
            label={voteButtonString}
            isLarge
          />
        </div>
        <div className="mt-6 py-2 mx-2 border-t border-gray-300">
          <ContentBanner description={t('descriptionCastVote')} />
        </div>
      </div>
    </>
  );
}

export default CastVote;
