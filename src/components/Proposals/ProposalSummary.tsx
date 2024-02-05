import { Text, Box, Divider, Flex, Tooltip } from '@chakra-ui/react';
import { ArrowAngleUp } from '@decent-org/fractal-ui';
import { format } from 'date-fns';
import { BigNumber } from 'ethers';
import { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BACKGROUND_SEMI_TRANSPARENT } from '../../constants/common';
import useBlockTimestamp from '../../hooks/utils/useBlockTimestamp';
import { useFractal } from '../../providers/App/AppProvider';
import { AzoriusGovernance, AzoriusProposal, GovernanceType } from '../../types';
import { DEFAULT_DATE_TIME_FORMAT } from '../../utils/numberFormats';
import ContentBox from '../ui/containers/ContentBox';
import { DisplayAddress } from '../ui/links/DisplayAddress';
import DisplayTransaction from '../ui/links/DisplayTransaction';
import EtherscanLinkBlock from '../ui/links/EtherscanLinkBlock';
import { InfoBoxLoader } from '../ui/loaders/InfoBoxLoader';
import { QuorumProgressBar } from '../ui/utils/ProgressBar';
import { InfoRow } from './MultisigProposalDetails/TxDetails';

export default function ProposalSummary({
  proposal: {
    eventDate,
    startBlock,
    votesSummary: { yes, no, abstain },
    deadlineMs,
    proposer,
    transactionHash,
  },
}: {
  proposal: AzoriusProposal;
}) {
  const {
    governance,
    governanceContracts: { tokenContract },
    readOnly: {
      user: { votingWeight, address },
    },
  } = useFractal();

  const azoriusGovernance = governance as AzoriusGovernance;
  const { votesToken, type, erc721Tokens, votingStrategy } = azoriusGovernance;
  const { t } = useTranslation(['proposal', 'common', 'navigation']);
  const startBlockTimeStamp = useBlockTimestamp(startBlock.toNumber());
  const [proposalsERC20VotingWeight, setProposalsERC20VotingWeight] = useState('0');
  const totalVotesCasted = useMemo(() => yes.add(no).add(abstain), [yes, no, abstain]);
  const totalVotingWeight = useMemo(
    () =>
      erc721Tokens?.reduce(
        (prev, curr) => prev.add(curr.totalSupply?.mul(curr.votingWeight) || BigNumber.from(0)),
        BigNumber.from(0)
      ),
    [erc721Tokens]
  );
  const votesTokenDecimalsDenominator = useMemo(
    () => BigNumber.from(10).pow(votesToken?.decimals || 0),
    [votesToken?.decimals]
  );

  useEffect(() => {
    async function loadProposalVotingWeight() {
      if (tokenContract && address) {
        const pastVotingWeight = await tokenContract.asSigner.getPastVotes(address, startBlock);
        setProposalsERC20VotingWeight(
          pastVotingWeight.div(votesTokenDecimalsDenominator).toString()
        );
      }
    }

    loadProposalVotingWeight();
  }, [address, startBlock, tokenContract, votesTokenDecimalsDenominator]);

  const getVotesPercentage = (voteTotal: BigNumber): number => {
    if (type === GovernanceType.AZORIUS_ERC20) {
      if (!votesToken?.totalSupply || votesToken.totalSupply.eq(0)) {
        return 0;
      }
      return voteTotal.div(votesToken.totalSupply.div(100)).toNumber();
    } else if (type === GovernanceType.AZORIUS_ERC721) {
      if (totalVotesCasted.eq(0) || !erc721Tokens || !totalVotingWeight) {
        return 0;
      }
      return voteTotal.mul(100).div(totalVotingWeight).toNumber();
    }
    return 0;
  };

  const isERC20 = type === GovernanceType.AZORIUS_ERC20;
  const isERC721 = type === GovernanceType.AZORIUS_ERC721;
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
  const strategyQuorum =
    votesToken && isERC20
      ? votingStrategy.quorumPercentage!.value.toNumber()
      : isERC721
      ? votingStrategy.quorumThreshold!.value.toNumber()
      : 1;

  return (
    <ContentBox containerBoxProps={{ bg: BACKGROUND_SEMI_TRANSPARENT }}>
      <Text textStyle="text-lg-mono-medium">{t('proposalSummaryTitle')}</Text>
      <Box marginTop={4}>
        <Divider color="chocolate.700" />
        <InfoRow
          property={t('votingSystem')}
          value={t('singleSnapshotVotingSystem')}
        />
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
        <Flex
          marginTop={4}
          justifyContent="space-between"
        >
          <Text
            textStyle="text-base-sans-regular"
            color="chocolate.200"
          >
            {t('snapshotTaken')}
          </Text>
          <EtherscanLinkBlock blockNumber={startBlock.toString()}>
            {format(eventDate, DEFAULT_DATE_TIME_FORMAT)} <ArrowAngleUp />
          </EtherscanLinkBlock>
        </Flex>
        <Flex
          marginTop={4}
          marginBottom={4}
          justifyContent="space-between"
        >
          <Text
            textStyle="text-base-sans-regular"
            color="chocolate.200"
          >
            {t('votingPower')}
          </Text>
          <Tooltip label={isERC721 ? votingWeight.toString() : proposalsERC20VotingWeight}>
            <Text
              textStyle="text-base-sans-regular"
              color="gold.500"
            >
              {t('show')}
            </Text>
          </Tooltip>
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
        <QuorumProgressBar
          helperText={t(
            isERC20
              ? 'proposalSupportERC20SummaryHelper'
              : isERC721
              ? 'proposalSupportERC721SummaryHelper'
              : '',
            {
              quorum: strategyQuorum,
              total: isERC721
                ? totalVotingWeight?.toString()
                : votesToken?.totalSupply.div(votesTokenDecimalsDenominator).toString(),
            }
          )}
          valueLabel={
            isERC721 ? `${yes.add(abstain).toString()}/${totalVotingWeight?.toString()}` : undefined
          }
          percentage={yesVotesPercentage}
          reachedQuorum={
            isERC721
              ? totalVotesCasted.sub(no).toString()
              : votesToken
              ? totalVotesCasted.sub(no).div(votesTokenDecimalsDenominator).toString()
              : '0'
          }
          totalQuorum={
            isERC721
              ? totalVotingWeight?.toString()
              : votesToken?.totalSupply.div(votesTokenDecimalsDenominator).toString()
          }
          unit={isERC20 ? '%' : ''}
        />
      </Box>
    </ContentBox>
  );
}
