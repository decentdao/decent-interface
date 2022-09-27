import { TokenEventType } from '../../providers/treasury/types';
import { useFractal } from '../../providers/fractal/hooks/useFractal';
import ContentBox from '../ui/ContentBox';
import ContentBoxTitle from '../ui/ContentBoxTitle';
import H1 from '../ui/H1';
import EtherscanTransactionLink from '../ui/EtherscanTransactionLink';
import { BigNumber } from 'ethers';
import { useTreasuryInjector } from '../../controller/Modules/injectors/TreasuryInjectorContext';
import { useGovernanceInjector } from '../../controller/Modules/injectors/GovernanceInjectorConext';

function Dashboard() {
  const { dao } = useFractal();
  const { transactions } = useTreasuryInjector();
  const { proposals } = useGovernanceInjector();
  const allEvents = [...transactions, ...(proposals || [])];

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
            {transaction.amount?.toString
              ? transaction.amount.toString()
              : transaction.amount ||
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
