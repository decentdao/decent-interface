import { Grid, GridItem, Hide, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import useDisplayName from '../../../hooks/utils/useDisplayName';
import { useFractal } from '../../../providers/App/AppProvider';
import { ProposalVote } from '../../../types';
import { formatPercentage, formatCoin } from '../../../utils';
import StatusBox from '../../ui/badges/StatusBox';
import Divider from '../../ui/utils/Divider';

export default function ProposalERC20VoteItem({
  vote,
  govTokenTotalSupply,
  govTokenDecimals,
  govTokenSymbol,
}: {
  vote: ProposalVote;
  govTokenTotalSupply: bigint;
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
      templateColumns={{ base: 'repeat(1, 1fr)', lg: 'repeat(4, 1fr)' }}
      gap={{ base: '0.25rem', lg: 0 }}
      width="100%"
    >
      <GridItem colSpan={1}>
        <Text
          textStyle="body-base"
          color="neutral-7"
        >
          {displayName}
          {user.address === vote.voter && t('isMeSuffix')}
        </Text>
      </GridItem>
      <GridItem colSpan={1}>
        <StatusBox>
          <Text
            textStyle="body-base"
            color="neutral-7"
          >
            {t(vote.choice.label)}
          </Text>
        </StatusBox>
      </GridItem>
      <GridItem colSpan={1}>
        <Text
          textStyle="body-base"
          color="neutral-7"
        >
          {formatPercentage(vote.weight, govTokenTotalSupply)}
        </Text>
      </GridItem>
      <GridItem colSpan={1}>
        <Text
          textStyle="body-base"
          color="neutral-7"
        >
          {formatCoin(vote.weight, true, govTokenDecimals, govTokenSymbol)}
        </Text>
      </GridItem>
      <Hide above="lg">
        <Divider
          variant="darker"
          my="0.5rem"
        />
      </Hide>
    </Grid>
  );
}
