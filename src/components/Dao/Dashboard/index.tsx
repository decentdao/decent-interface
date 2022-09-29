import { useFractal } from '../../../providers/fractal/hooks/useFractal';
import ContentBox from '../../ui/ContentBox';
import H1 from '../../ui/H1';
import {
  Transaction,
  useTreasuryInjector,
} from '../../../controller/Modules/injectors/TreasuryInjectorContext';
import { useGovernanceInjector } from '../../../controller/Modules/injectors/GovernanceInjectorConext';
import TransactionCard from './components/TransactionCard';
import ProposalCard from './components/ProposalCard';
import { ProposalData } from '../../../providers/govenor/types';
import { ContractEvent } from '../../../types/contract';

function Dashboard() {
  const { dao, modules } = useFractal();
  const { transactions } = useTreasuryInjector();
  const { proposals } = useGovernanceInjector();

  // Since we're showing whole Activity Feed as single "stream of data"
  // We need to combine those 2 arrays together and sort it
  const allEvents: ContractEvent[] = [...transactions, ...(proposals || [])].sort(
    (a, b) => b.blockTimestamp - a.blockTimestamp
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
              key={proposalEvent.id.toString()}
              proposal={proposalEvent}
              daoAddress={dao.daoAddress}
              moduleAddress={
                modules.tokenVotingGovernanceModule?.moduleAddress ||
                modules.gnosisWrapperModule?.moduleAddress
              }
            />
          );
        }
      })}
    </div>
  );
}

export default Dashboard;
