import { Grid, GridItem, Text } from '@chakra-ui/react';
import { BigNumber } from 'ethers';
import { useTranslation } from 'react-i18next';
import useDisplayName from '../../../hooks/utils/useDisplayName';
import { useFractal } from '../../../providers/App/AppProvider';
import { ProposalVote } from '../../../types';
import { formatPercentage, formatCoin } from '../../../utils';
import StatusBox from '../../ui/badges/StatusBox';

export default function ProposalERC20VoteItem({
  vote,
  govTokenTotalSupply,
  govTokenDecimals,
  govTokenSymbol,
}: {
  vote: ProposalVote;
  govTokenTotalSupply: BigNumber;
  govTokenDecimals: number;
  govTokenSymbol: string;
}) {
  const { t } = useTranslation();
  const { displayName } = useDisplayName(vote.voter);
  const {
    readOnly: { user },
  } = useFractal();
  return (
    <Grid
      templateColumns="repeat(4, 1fr)"
      width="100%"
    >
      <GridItem colSpan={1}>
        <Text textStyle="text-base-sans-regular">
          {displayName}
          {user.address === vote.voter && t('isMeSuffix')}
        </Text>
      </GridItem>
      <GridItem colSpan={1}>
        <StatusBox>
          <Text textStyle="text-sm-mono-semibold">{t(vote.choice)}</Text>
        </StatusBox>
      </GridItem>
      <GridItem colSpan={1}>
        <Text textStyle="text-base-sans-regular">
          {formatPercentage(vote.weight, govTokenTotalSupply)}
        </Text>
      </GridItem>
      <GridItem colSpan={1}>
        <Text textStyle="text-base-sans-regular">
          {formatCoin(vote.weight, true, govTokenDecimals, govTokenSymbol)}
        </Text>
      </GridItem>
    </Grid>
  );
}
