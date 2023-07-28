import { Text, Box, Divider, Flex } from '@chakra-ui/react';
import { format } from 'date-fns';
import { BigNumber } from 'ethers';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BACKGROUND_SEMI_TRANSPARENT } from '../../constants/common';
import useBlockTimestamp from '../../hooks/utils/useBlockTimestamp';
import { useFractal } from '../../providers/App/AppProvider';
import { AzoriusGovernance, AzoriusProposal, GovernanceSelectionType } from '../../types';
import { DEFAULT_DATE_TIME_FORMAT } from '../../utils/numberFormats';
import ContentBox from '../ui/containers/ContentBox';
import { DisplayAddress } from '../ui/links/DisplayAddress';
import DisplayTransaction from '../ui/links/DisplayTransaction';
import { InfoBoxLoader } from '../ui/loaders/InfoBoxLoader';
import { ExtendedProgressBar } from '../ui/utils/ProgressBar';
import { InfoRow } from './MultisigProposalDetails/TxDetails';

export default function ProposalSummary({
  proposal: {
    startBlock,
    votesSummary: { yes, no, abstain, quorum },
    deadlineMs,
    proposer,
    transactionHash,
  },
}: {
  proposal: AzoriusProposal;
}) {
  const { governance } = useFractal();

  const azoriusGovernance = governance as AzoriusGovernance;
  const { votesToken, type, erc721Tokens, votingStrategy } = azoriusGovernance;
  const { t } = useTranslation(['proposal', 'common', 'navigation']);
  const startBlockTimeStamp = useBlockTimestamp(startBlock.toNumber());
  const totalVotesCasted = useMemo(() => yes.add(no).add(abstain), [yes, no, abstain]);
  const getVotesPercentage = (voteTotal: BigNumber): number => {
    if (type === GovernanceSelectionType.AZORIUS_ERC20) {
      if (!votesToken?.totalSupply || votesToken.totalSupply.eq(0)) {
        return 0;
      }
      return voteTotal.div(votesToken.totalSupply.div(100)).toNumber();
    } else if (type === GovernanceSelectionType.AZORIUS_ERC721) {
      if (totalVotesCasted.eq(0) || !erc721Tokens) {
        return 0;
      }
      const totalVotingWeight = erc721Tokens.reduce(
        (prev, curr) => prev.add(curr.totalSupply?.mul(curr.votingWeight) || BigNumber.from(0)),
        BigNumber.from(0)
      );
      return voteTotal.mul(100).div(totalVotingWeight).toNumber();
    }
    return 0;
  };

  const isERC20 = type === GovernanceSelectionType.AZORIUS_ERC20;
  const isERC721 = type === GovernanceSelectionType.AZORIUS_ERC721;
  if (
    (isERC20 && (!votesToken || !votesToken.totalSupply)) ||
    (isERC721 && (!erc721Tokens || !votingStrategy.quorumThreshold))
  ) {
    return (
      <Box mt={4}>
        <InfoBoxLoader />
      </Box>
    );
  }

  const yesVotesPercentage = getVotesPercentage(yes);
  const noVotesPercentage = getVotesPercentage(no);
  const strategyQuorum =
    votesToken && isERC20
      ? quorum.div(votesToken.totalSupply.div(100)).toNumber()
      : isERC721
      ? votingStrategy.quorumThreshold!.value.toNumber()
      : 1;
  const requiredVotesToPass = Math.max(noVotesPercentage + 1, strategyQuorum);

  return (
    <ContentBox containerBoxProps={{ bg: BACKGROUND_SEMI_TRANSPARENT }}>
      <Text textStyle="text-lg-mono-medium">{t('proposalSummaryTitle')}</Text>
      <Box marginTop={4}>
        <Divider color="chocolate.700" />
        <InfoRow
          property={t('proposalSummaryStartDate')}
          value={format(startBlockTimeStamp * 1000, DEFAULT_DATE_TIME_FORMAT)}
        />
        <InfoRow
          property={t('proposalSummaryEndDate')}
          value={format(deadlineMs, DEFAULT_DATE_TIME_FORMAT)}
        />
        <Flex
          marginTop={4}
          marginBottom={4}
          justifyContent="space-between"
        >
          <Text
            textStyle="text-base-sans-regular"
            color="chocolate.200"
          >
            {t('proposedBy')}
          </Text>
          <DisplayAddress address={proposer} />
        </Flex>
        {transactionHash && (
          <Flex
            marginTop={4}
            marginBottom={4}
            justifyContent="space-between"
          >
            <Text
              textStyle="text-base-sans-regular"
              color="chocolate.200"
            >
              {t('transactionHash')}
            </Text>
            <DisplayTransaction txHash={transactionHash} />
          </Flex>
        )}
        <Divider color="chocolate.700" />
      </Box>
      <Box marginTop={4}>
        <ExtendedProgressBar
          label={t('support')}
          helperText={t('proposalSupportSummaryHelper', { count: requiredVotesToPass })}
          percentage={yesVotesPercentage}
          requiredPercentage={requiredVotesToPass}
        />
      </Box>
    </ContentBox>
  );
}
