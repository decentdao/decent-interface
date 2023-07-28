import { Grid, GridItem, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import useDisplayName from '../../../hooks/utils/useDisplayName';
import { useFractal } from '../../../providers/App/AppProvider';
import { AzoriusGovernance, ERC721ProposalVote } from '../../../types';
import StatusBox from '../../ui/badges/StatusBox';

export default function ProposalERC721VoteItem({
  vote: { voter, choice, tokenAddresses },
}: {
  vote: ERC721ProposalVote;
  proposalId: string;
}) {
  const { t } = useTranslation(['common', 'proposal']);
  const { displayName } = useDisplayName(voter);
  const {
    governance,
    readOnly: { user },
  } = useFractal();

  const azoriusGovernance = governance as AzoriusGovernance;
  const { erc721Tokens } = azoriusGovernance;
  const votedTokens = erc721Tokens?.filter(token => tokenAddresses.includes(token.address));
  const weight = tokenAddresses
    .map(address => {
      const votingToken = erc721Tokens!.find(token => token.address === address);
      return votingToken!.votingWeight;
    })
    .reduce((a, b) => a.add(b));

  return (
    <Grid
      templateColumns="repeat(3, 1fr)"
      width="100%"
    >
      <GridItem colSpan={1}>
        <Text textStyle="text-base-sans-regular">
          {displayName}
          {user.address === voter && t('isMeSuffix')}
        </Text>
      </GridItem>
      <GridItem colSpan={1}>
        <StatusBox>
          <Text textStyle="text-sm-mono-semibold">{t(choice)}</Text>
        </StatusBox>
      </GridItem>
      {votedTokens && (
        <GridItem colSpan={1}>
          <Text>{`${votedTokens.map(token => token.symbol).join()} ${t('nftVotes', {
            count: weight.toNumber(),
            ns: 'proposal',
          })}`}</Text>
        </GridItem>
      )}
    </Grid>
  );
}
