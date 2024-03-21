import { Box, Flex } from '@chakra-ui/react';
import { Check } from '@decent-org/fractal-ui';
import { BigNumber } from 'ethers';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import useSafeContracts from '../../../hooks/safe/useSafeContracts';
import { useFractal } from '../../../providers/App/AppProvider';
import {
  AzoriusGovernance,
  AzoriusProposal,
  FractalProposal,
  SnapshotProposal,
} from '../../../types';

const quorumNotReachedColor = '#838383';
const quorumReachedColor = '#56A355';
export default function QuorumBadge({ proposal }: { proposal: FractalProposal }) {
  const {
    governance,
    governanceContracts: { ozLinearVotingContractAddress },
  } = useFractal();
  const baseContracts = useSafeContracts();
  const { t } = useTranslation('common');

  const azoriusGovernance = governance as AzoriusGovernance;
  const { votesToken, erc721Tokens, votingStrategy } = azoriusGovernance;

  const { votesSummary } = proposal as AzoriusProposal;
  const totalVotesCasted = useMemo(() => {
    if (votesSummary) {
      return votesSummary.yes.add(votesSummary.no).add(votesSummary.abstain);
    }
    return BigNumber.from(0);
  }, [votesSummary]);

  const erc20MeetsQuorum = useMemo(async () => {
    if (!ozLinearVotingContractAddress || !baseContracts || !votesToken || !votesSummary) {
      return undefined;
    }
    const linearStrategyContract = baseContracts.linearVotingMasterCopyContract.asProvider.attach(
      ozLinearVotingContractAddress,
    );
    const result = await linearStrategyContract.meetsQuorum(
      votesToken.totalSupply,
      votesSummary.yes,
      votesSummary.abstain,
    );
    return result;
  }, [votesToken, votesSummary, baseContracts, ozLinearVotingContractAddress]);

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
    erc721Tokens !== undefined ? votingStrategy.quorumThreshold!.value.toNumber() : 1;
  const reachedQuorum =
    erc721Tokens !== undefined ? totalVotesCasted.sub(votesSummary.no).toString() : '0';
  const totalQuorum = erc721Tokens !== undefined ? strategyQuorum.toString() : 0;

  const meetsQuorum =
    erc20MeetsQuorum !== undefined ? erc20MeetsQuorum : reachedQuorum >= totalQuorum;

  const displayColor =
    !totalVotesCasted.isZero() && meetsQuorum ? quorumReachedColor : quorumNotReachedColor;
  return (
    <Box
      rounded="md"
      textStyle="text-md-sans-regular"
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
