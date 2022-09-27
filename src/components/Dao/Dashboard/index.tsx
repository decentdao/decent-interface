import { useFractal } from '../../../providers/fractal/hooks/useFractal';
import ContentBox from '../../ui/ContentBox';
import H1 from '../../ui/H1';
import {
  Transaction,
  useTreasuryInjector,
} from '../../../controller/Modules/injectors/TreasuryInjectorContext';
import { useGovernanceInjector } from '../../../controller/Modules/injectors/GovernanceInjectorConext';
import TransactionCard from './components/TransactionCard';
import ProposalCard from '../../Proposals/ProposalCard';
import { ProposalData } from '../../../providers/govenor/types';

function Dashboard() {
  const { dao } = useFractal();
  const { transactions } = useTreasuryInjector();
  const { proposals } = useGovernanceInjector();

  // Since we're showing whole Activity Feed as single "stream of data"
  // We need to combine those 2 arrays together and sort it
  const allEvents: (Transaction | ProposalData)[] = [...transactions, ...(proposals || [])].sort(
    (a, b) => {
      let aDateTime = (a as ProposalData).startTime;
      let bDateTime = (b as ProposalData).startTime;

      if (!aDateTime) {
        aDateTime = new Date((a as Transaction).blockTimestamp * 1000);
      }

      if (!bDateTime) {
        bDateTime = new Date((b as Transaction).blockTimestamp * 1000);
      }

      return bDateTime.getTime() - aDateTime.getTime();
    }
  );

  return (
    <div>
      <ContentBox>
        <H1>{dao.daoName}</H1>
      </ContentBox>
      <H1>Latest Activity</H1>
      {allEvents.map(event => {
        // This arrays combination also brings such weird checks
        const transactionEvent = event as Transaction;
        if (transactionEvent.transactionHash) {
          return (
            <TransactionCard
              key={transactionEvent.transactionHash}
              transaction={transactionEvent}
            />
          );
        }
        const proposalEvent = event as ProposalData;
        if (proposalEvent.id) {
          return (
            <ProposalCard
              proposal={proposalEvent}
              key={proposalEvent.id.toString()}
            />
          );
        }
      })}
    </div>
  );
}

export default Dashboard;
