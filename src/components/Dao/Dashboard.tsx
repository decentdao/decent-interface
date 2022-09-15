import {
  TokenDepositEvent,
  TokenWithdrawEvent,
  ERC20TokenEvent,
  ERC721TokenEvent,
  TokenEventType,
} from '../../providers/treasury/types';
import { useFractal } from '../../providers/fractal/hooks/useFractal';
import ContentBox from '../ui/ContentBox';
import ContentBoxTitle from '../ui/ContentBoxTitle';
import H1 from '../ui/H1';
import EtherscanTransactionLink from '../ui/EtherscanTransactionLink';
import { BigNumber } from 'ethers';

// This component should replace Summary, but for development purpose - it is kept alongside
type DashboardProps = {
  transactions?: (TokenDepositEvent | TokenWithdrawEvent | ERC20TokenEvent | ERC721TokenEvent)[];
};
function Dashboard({ transactions }: DashboardProps) {
  const { dao } = useFractal();

  return (
    <div>
      <ContentBox>
        <H1>{dao.daoName}</H1>
      </ContentBox>
      <H1>Latest Activity</H1>
      {transactions?.map((transaction: any) => (
        <ContentBox key={transaction.transactionHash}>
          <ContentBoxTitle>
            {transaction.eventType === TokenEventType.DEPOSIT ? 'Received' : 'Sent'}{' '}
            {transaction.amount ||
              transaction.amounts?.map((amount: BigNumber) => amount.toString())}
          </ContentBoxTitle>
          <EtherscanTransactionLink txHash={transaction.transactionHash}>
            View on Etherscan
          </EtherscanTransactionLink>
        </ContentBox>
      ))}
    </div>
  );
}

export default Dashboard;
