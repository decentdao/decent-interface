import { Box, Flex } from '@chakra-ui/react';
import { Check } from '@decent-org/fractal-ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useFractal } from '../../../providers/App/AppProvider';
import {
  AzoriusGovernance,
  AzoriusProposal,
  FractalProposal,
  SnapshotProposal,
} from '../../../types';

export default function QuorumBadge({ proposal }: { proposal: FractalProposal }) {
  const { governance } = useFractal();
  const { t } = useTranslation('common');

  const azoriusGovernance = governance as AzoriusGovernance;
  const { votesToken, erc721Tokens, votingStrategy } = azoriusGovernance;

  const { votesSummary } = proposal as AzoriusProposal;
  const totalVotesCasted = useMemo(() => {
    if (votesSummary) {
      return votesSummary.yes + votesSummary.no + votesSummary.abstain;
    }
    return 0n;
  }, [votesSummary]);

  const votesTokenDecimalsDenominator = useMemo(
    () => 10n ** BigInt(votesToken?.decimals || 0),
    [votesToken?.decimals],
  );

  // @dev only azorius governance has quorum
  if ((proposal as SnapshotProposal).snapshotProposalId || !votingStrategy) {
    return null;
  }

  if (votesToken !== undefined && erc721Tokens !== undefined) {
    return null;
  }

  const quorumDisplay = !!votingStrategy.quorumPercentage
    ? votingStrategy.quorumPercentage.formatted
    : !!votingStrategy.quorumThreshold
      ? votingStrategy.quorumThreshold.formatted
      : null;

  const strategyQuorum =
    erc721Tokens !== undefined
      ? votingStrategy.quorumThreshold!.value
      : votesToken !== undefined
        ? votingStrategy.quorumPercentage!.value
        : 0n;
  const reachedQuorum = votesSummary ?
    erc721Tokens !== undefined
      ? totalVotesCasted - votesSummary.no
      : votesToken !== undefined
        ? (totalVotesCasted - votesSummary.no) / votesTokenDecimalsDenominator
        : 0n : 0n;
  const totalQuorum = erc721Tokens !== undefined ? strategyQuorum : 0n;

  const meetsQuorum = votesToken
    ? (votesToken.totalSupply / votesTokenDecimalsDenominator / 100n) * strategyQuorum <
      reachedQuorum
    : reachedQuorum >= totalQuorum;

  const displayColor = totalVotesCasted !== 0n && meetsQuorum ? 'celery--3' : 'neutral-7';
  return (
    <Box
      rounded="md"
      textStyle="label-base"
      borderColor={displayColor}
      textColor={displayColor}
      border="1px solid"
      px="0.5rem"
      h="1.5rem"
      lineHeight={1.5}
    >
      <Flex
        gap={2}
        alignItems="center"
      >
        <Check boxSize={4} />
        <Box>{t('quorum', { ns: 'common' })}</Box>
        <Box>{quorumDisplay}</Box>
      </Flex>
    </Box>
  );
}
