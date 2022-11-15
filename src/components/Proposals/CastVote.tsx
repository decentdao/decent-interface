import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useCastVote from '../../providers/fractal/hooks/useCastVote';
import { Proposal, ProposalState } from '../../providers/fractal/types';
import ContentBanner from '../ui/ContentBanner';
import { PrimaryButton, SecondaryButton } from '../ui/forms/Button';
import Check from '../ui/svg/Check';

interface IOptionSelected {
  newVote?: number;
  proposal: Proposal;
}

function NoSelected({ newVote, proposal }: IOptionSelected) {
  return newVote === 0 || proposal.userVote?.choice === 'no' ? <Check /> : null;
}
function YesSelected({ newVote, proposal }: IOptionSelected) {
  return newVote === 1 || proposal.userVote?.choice === 'yes' ? <Check /> : null;
}
function AbstainedSelected({ newVote, proposal }: IOptionSelected) {
  return newVote === 2 || proposal.userVote?.choice === 'abstain' ? <Check /> : null;
}

function CastVote({ proposal }: { proposal: Proposal }) {
  const [newVote, setNewVote] = useState<number>();
  const [voteButtonString, setVoteButtonString] = useState<string>();
  const [pending, setPending] = useState<boolean>(false);
  const { t } = useTranslation('proposal');

  const buttonsDisabled =
    proposal.state !== ProposalState.Active || proposal.userVote !== undefined || pending;

  useEffect(() => {
    if (proposal.state !== ProposalState.Active) {
      setVoteButtonString(t('labelVotingClosed'));
    } else if (proposal.userVote !== undefined) {
      setVoteButtonString(t('labelAlreadyVoted'));
    } else if (false) {
      // proposal.userVotePower === undefined || proposal.userVotePower.eq(0)
      setVoteButtonString(t('labelNoVotes'));
    } else {
      setVoteButtonString(t('labelCastVote'));
    }
  }, [proposal, t]);

  const castVote = useCastVote({
    proposalNumber: proposal.proposalNumber,
    vote: newVote,
    setPending: setPending,
  });
  return (
    <div className="flex flex-col bg-gray-600 my-2 p-2 pb-4 w-3/5 rounded-md">
      <div className="flex mx-2 my-2 text-gray-25 text-lg font-semibold">Cast Vote</div>
      <hr className="mx-2 mb-6 border-gray-200" />
      <div className="flex flex-col gap-4">
        <SecondaryButton
          onClick={() => setNewVote(1)}
          icon={
            <YesSelected
              proposal={proposal}
              newVote={newVote}
            />
          }
          disabled={buttonsDisabled}
          label={t('labelVoteYes')}
          isIconRight
          isSpaceBetween
          isLarge
        />
        <SecondaryButton
          onClick={() => setNewVote(0)}
          icon={
            <NoSelected
              proposal={proposal}
              newVote={newVote}
            />
          }
          disabled={buttonsDisabled}
          label={t('labelVoteNo')}
          isIconRight
          isSpaceBetween
          isLarge
        />
        <SecondaryButton
          onClick={() => setNewVote(2)}
          icon={
            <AbstainedSelected
              proposal={proposal}
              newVote={newVote}
            />
          }
          disabled={buttonsDisabled}
          label={t('labelAbstain')}
          isIconRight
          isSpaceBetween
          isLarge
        />
        <PrimaryButton
          className="mt-4"
          onClick={castVote}
          disabled={newVote === undefined || buttonsDisabled}
          label={voteButtonString}
          isLarge
        />
      </div>
      <div className="mt-6 py-2 mx-2 border-t border-gray-300">
        <ContentBanner description={t('descriptionCastVote')} />
      </div>
    </div>
  );
}

export default CastVote;
