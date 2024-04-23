import { Button, Tooltip, Box, Text, Image, Flex } from '@chakra-ui/react';
import { CloseX, Check, SingleCheckOutline } from '@decent-org/fractal-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSnapshotProposal from '../../../hooks/DAO/loaders/snapshot/useSnapshotProposal';
import useCastVote from '../../../hooks/DAO/proposal/useCastVote';
import useCurrentBlockNumber from '../../../hooks/utils/useCurrentBlockNumber';
import {
  FractalProposal,
  AzoriusProposal,
  FractalProposalState,
  AzoriusVoteChoice,
  ExtendedSnapshotProposal,
} from '../../../types';
import WeightedInput from '../../ui/forms/WeightedInput';
import { useVoteContext } from '../ProposalVotes/context/VoteContext';

function Vote({
  proposal,
  extendedSnapshotProposal,
  onCastSnapshotVote,
}: {
  proposal: FractalProposal;
  extendedSnapshotProposal?: ExtendedSnapshotProposal;
  onCastSnapshotVote?: () => Promise<void>;
}) {
  const [pending, setPending] = useState<boolean>(false);
  const { t } = useTranslation(['common', 'proposal', 'transaction']);
  const { isLoaded: isCurrentBlockLoaded, currentBlockNumber } = useCurrentBlockNumber();

  const azoriusProposal = proposal as AzoriusProposal;

  const {
    castVote,
    castSnapshotVote,
    handleChangeSnapshotWeightedChoice,
    handleSelectSnapshotChoice,
    selectedChoice,
    snapshotWeightedChoice,
  } = useCastVote({
    proposal,
    setPending,
    extendedSnapshotProposal,
  });

  const { isSnapshotProposal } = useSnapshotProposal(proposal);
  const { canVote, canVoteLoading, hasVoted, hasVotedLoading } = useVoteContext();

  // if the user is not a signer or has no delegated tokens, don't show anything
  if (!canVote) {
    return null;
  }

  // If user is lucky enough - he could create a proposal and proceed to vote on it
  // even before the block, in which proposal was created, was mined.
  // This gives a weird behavior when casting vote fails due to requirement under LinearERC20Voting contract that current block number
  // shouldn't be equal to proposal's start block number. Which is dictated by the need to have voting tokens delegation being "finalized" to prevent proposal hijacking.
  const proposalStartBlockNotFinalized = Boolean(
    !isSnapshotProposal &&
      isCurrentBlockLoaded &&
      currentBlockNumber &&
      azoriusProposal.startBlock >= currentBlockNumber,
  );

  const disabled =
    pending ||
    proposal.state !== FractalProposalState.ACTIVE ||
    proposalStartBlockNotFinalized ||
    canVoteLoading ||
    hasVotedLoading;

  if (isSnapshotProposal && extendedSnapshotProposal) {
    const isWeighted = extendedSnapshotProposal.type === 'weighted';
    const weightedTotalValue = snapshotWeightedChoice.reduce((prev, curr) => prev + curr, 0);
    const voteDisabled =
      (!isWeighted && typeof selectedChoice === 'undefined') ||
      (isWeighted && weightedTotalValue === 0);
    return (
      <>
        {isWeighted && snapshotWeightedChoice.length > 0
          ? extendedSnapshotProposal.choices.map((choice, i) => (
              <WeightedInput
                key={choice}
                label={choice}
                totalValue={weightedTotalValue}
                value={snapshotWeightedChoice[i]}
                onChange={newValue => handleChangeSnapshotWeightedChoice(i, newValue)}
              />
            ))
          : extendedSnapshotProposal.choices.map((choice, i) => (
              <Button
                key={choice}
                variant="secondary"
                width="full"
                onClick={() => handleSelectSnapshotChoice(i)}
                marginTop={5}
              >
                {selectedChoice === i && <Check boxSize="1.5rem" />}
                {choice}
              </Button>
            ))}
        <Button
          width="full"
          isDisabled={voteDisabled}
          onClick={() => castSnapshotVote(onCastSnapshotVote)}
          marginTop={5}
        >
          {t('vote')}
        </Button>
        {hasVoted && (
          <Box
            mt={4}
            color="grayscale.500"
            fontWeight="600"
          >
            <Flex>
              <SingleCheckOutline
                boxSize="1.5rem"
                mr={2}
              />
              <Text>{t('successCastVote', { ns: 'transaction' })}</Text>
            </Flex>
            <Text>{t('snapshotRecastVoteHelper', { ns: 'transaction' })}</Text>
          </Box>
        )}
        <Box
          mt={4}
          color="grayscale.700"
        >
          <Text>{t('poweredBy')}</Text>
          <Flex>
            <Flex mr={1}>
              {/* TODO: replace with <SnapshotIcon /> */}
              <Image
                src="/images/snapshot-icon.svg"
                alt="Snapshot icon"
                mr={1}
              />
              <Text>{t('snapshot')}</Text>
            </Flex>
            {extendedSnapshotProposal.privacy === 'shutter' && (
              <Flex>
                <Image
                  src="/images/shutter-icon.svg"
                  alt="Shutter icon"
                  mr={1}
                />
                <Text>{t('shutter')}</Text>
              </Flex>
            )}
          </Flex>
        </Box>
      </>
    );
  }

  return (
    <Tooltip
      placement="top"
      title={
        proposalStartBlockNotFinalized
          ? t('proposalStartBlockNotFinalized', { ns: 'proposal' })
          : hasVoted
            ? t('currentUserAlreadyVoted', { ns: 'proposal' })
            : undefined
      }
    >
      <>
        <Button
          width="full"
          isDisabled={disabled}
          onClick={() => castVote(AzoriusVoteChoice.Yes)}
          marginTop={5}
        >
          {t('approve')}
          <Check fill="black" />
        </Button>
        <Button
          marginTop={5}
          width="full"
          isDisabled={disabled}
          onClick={() => castVote(AzoriusVoteChoice.No)}
        >
          {t('reject')}
          <CloseX />
        </Button>
        <Button
          marginTop={5}
          width="full"
          isDisabled={disabled}
          onClick={() => castVote(AzoriusVoteChoice.Abstain)}
        >
          {t('abstain')}
        </Button>
      </>
    </Tooltip>
  );
}

export default Vote;
