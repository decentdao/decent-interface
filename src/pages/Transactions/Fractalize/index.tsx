import { useState } from 'react';
import DaoCreator from '../../../components/DaoCreator';
import { TokenAllocation } from '../../../hooks/useDeployDAO';

function Fractalize() {
  const [pending] = useState<boolean>(false);
  const [daoName, setDAOName] = useState<string>('');
  const [tokenName, setTokenName] = useState<string>('');
  const [tokenSymbol, setTokenSymbol] = useState<string>('');
  const [tokenSupply, setTokenSupply] = useState<string>('');
  const [tokenAllocations, setTokenAllocations] = useState<TokenAllocation[]>([
    { address: '', amount: 0 },
  ]);
  const [proposalThreshold, setProposalThreshold] = useState<string>('0');
  const [quorum, setQuorum] = useState<string>('4');
  const [executionDelay, setExecutionDelay] = useState<string>('6545');
  const [lateQuorumExecution, setLateQuorumExecution] = useState<string>('0');
  const [voteStartDelay, setVoteStartDelay] = useState<string>('6545');
  const [votingPeriod, setVotingPeriod] = useState<string>('45818');

  const logit = () => {
    console.log({
      daoName,
      tokenName,
      tokenSymbol,
      tokenSupply,
      tokenAllocations,
      proposalThreshold,
      quorum,
      executionDelay,
      lateQuorumExecution,
      voteStartDelay,
      votingPeriod,
    });
  };

  return (
    <DaoCreator
      pending={pending}
      daoName={daoName}
      setDAOName={setDAOName}
      tokenName={tokenName}
      setTokenName={setTokenName}
      tokenSymbol={tokenSymbol}
      setTokenSymbol={setTokenSymbol}
      tokenSupply={tokenSupply}
      setTokenSupply={setTokenSupply}
      tokenAllocations={tokenAllocations}
      setTokenAllocations={setTokenAllocations}
      proposalThreshold={proposalThreshold}
      setProposalThreshold={setProposalThreshold}
      quorum={quorum}
      setQuorum={setQuorum}
      executionDelay={executionDelay}
      setExecutionDelay={setExecutionDelay}
      lateQuorumExecution={lateQuorumExecution}
      setLateQuorumExecution={setLateQuorumExecution}
      voteStartDelay={voteStartDelay}
      setVoteStartDelay={setVoteStartDelay}
      votingPeriod={votingPeriod}
      setVotingPeriod={setVotingPeriod}
      nextLabel="Log it"
      nextTrigger={logit}
    />
  );
}

export default Fractalize;
