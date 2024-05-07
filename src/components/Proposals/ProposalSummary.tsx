import { Text, Box, Button, Divider, Flex, Tooltip } from '@chakra-ui/react';
import { ArrowAngleUp } from '@decent-org/fractal-ui';
import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getAddress, getContract } from 'viem';
import { usePublicClient } from 'wagmi';
import VotesERC20Abi from '../../assets/abi/VotesERC20';
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
import InfoRow from '../ui/proposal/InfoRow';
import { QuorumProgressBar } from '../ui/utils/ProgressBar';

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
    readOnly: {
      user: { votingWeight, address },
    },
  } = useFractal();

  const azoriusGovernance = governance as AzoriusGovernance;
  const { votesToken, type, erc721Tokens, votingStrategy } = azoriusGovernance;
  const { t } = useTranslation(['proposal', 'common', 'navigation']);
  const startBlockTimeStamp = useBlockTimestamp(Number(startBlock));
  const [proposalsERC20VotingWeight, setProposalsERC20VotingWeight] = useState('0');
  const totalVotesCasted = useMemo(() => yes + no + abstain, [yes, no, abstain]);
  const totalVotingWeight = useMemo(
    () =>
      erc721Tokens?.reduce(
        (prev, curr) => prev + (curr.totalSupply ? curr.totalSupply * curr.votingWeight : 0n),
        0n,
      ),
    [erc721Tokens],
  );
  const votesTokenDecimalsDenominator = useMemo(
    () => 10n ** BigInt(votesToken?.decimals || 0),
    [votesToken?.decimals],
  );
  const [showVotingPower, setShowVotingPower] = useState(false);

  const toggleShowVotingPower = () => setShowVotingPower(prevState => !prevState);

  const publicClient = usePublicClient();

  useEffect(() => {
    async function loadProposalVotingWeight() {
      if (address && votesToken && publicClient) {
        const tokenContract = getContract({
          abi: VotesERC20Abi,
          address: votesToken.address,
          client: publicClient,
        });

        const pastVotingWeight = await tokenContract.read.getPastVotes([
          getAddress(address),
          startBlock,
        ]);
        setProposalsERC20VotingWeight(
          (pastVotingWeight / votesTokenDecimalsDenominator).toString(),
        );
      }
    }

    loadProposalVotingWeight();
  }, [address, publicClient, startBlock, votesToken, votesTokenDecimalsDenominator]);

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

  const strategyQuorum =
    votesToken && isERC20
      ? votingStrategy.quorumPercentage!.value
      : isERC721
        ? votingStrategy.quorumThreshold!.value
        : 1n;
  const reachedQuorum = isERC721
    ? totalVotesCasted - no
    : votesToken
      ? (totalVotesCasted - no) / votesTokenDecimalsDenominator
      : 0n;
  const totalQuorum = isERC721
    ? strategyQuorum
    : votesToken
      ? (votesToken.totalSupply / votesTokenDecimalsDenominator / 100n) * strategyQuorum
      : undefined;

  const ShowVotingPowerButton = (
    <Button
      pr={0}
      py={0}
      height="auto"
      justifyContent="flex-end"
      alignItems="flex-start"
      variant="link"
      textStyle="text-base-sans-regular"
      color="gold.500"
      onClick={toggleShowVotingPower}
    >
      {showVotingPower
        ? isERC721
          ? votingWeight.toString()
          : proposalsERC20VotingWeight
        : t('show')}
    </Button>
  );

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
          tooltip={formatInTimeZone(startBlockTimeStamp * 1000, 'GMT', DEFAULT_DATE_TIME_FORMAT)}
        />
        <InfoRow
          property={t('proposalSummaryEndDate')}
          value={format(deadlineMs, DEFAULT_DATE_TIME_FORMAT)}
          tooltip={formatInTimeZone(deadlineMs, 'GMT', DEFAULT_DATE_TIME_FORMAT)}
        />
        <Flex
          marginTop={4}
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
          marginBottom={transactionHash ? 0 : 4}
          justifyContent="space-between"
        >
          <Text
            textStyle="text-base-sans-regular"
            color="chocolate.200"
          >
            {t('votingPower')}
          </Text>
          {showVotingPower ? (
            <Tooltip label={t('votingPowerTooltip')}>{ShowVotingPowerButton}</Tooltip>
          ) : (
            ShowVotingPowerButton
          )}
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
                : votesToken
                  ? (votesToken.totalSupply / votesTokenDecimalsDenominator).toString()
                  : undefined,
            },
          )}
          reachedQuorum={reachedQuorum}
          totalQuorum={totalQuorum}
          unit={isERC20 ? '%' : ''}
        />
      </Box>
    </ContentBox>
  );
}
