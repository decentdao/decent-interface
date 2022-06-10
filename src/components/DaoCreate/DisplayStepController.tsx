import { TokenAllocation } from '../../hooks/useDeployDAO';
import DAODetails from './DAODetails';
import GovernanceDetails from './GovernanceDetails';
import TokenDetails from './TokenDetails';

interface StepControllerProps {
  step: number;
  daoName: string;
  tokenName: string;
  tokenSymbol: string;
  tokenSupply: string;
  tokenAllocations: TokenAllocation[];
  proposalThreshold: string;
  quorum: string;
  executionDelay: string;
  lateQuorumExecution: string;
  voteStartDelay: string;
  votingPeriod: string;
  setDAOName: React.Dispatch<React.SetStateAction<string>>;
  setTokenName: React.Dispatch<React.SetStateAction<string>>;
  setTokenSymbol: React.Dispatch<React.SetStateAction<string>>;
  setTokenSupply: React.Dispatch<React.SetStateAction<string>>;
  setTokenAllocations: React.Dispatch<React.SetStateAction<TokenAllocation[]>>;
  setProposalThreshold: React.Dispatch<React.SetStateAction<string>>;
  setQuorum: React.Dispatch<React.SetStateAction<string>>;
  setExecutionDelay: React.Dispatch<React.SetStateAction<string>>;
  setLateQuorumExecution: React.Dispatch<React.SetStateAction<string>>;
  setVoteStartDelay: React.Dispatch<React.SetStateAction<string>>;
  setVotingPeriod: React.Dispatch<React.SetStateAction<string>>;
  setPrevEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  setNextEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  setDeployEnabled: React.Dispatch<React.SetStateAction<boolean>>;
}

// @todo look into reducing the number of props
function StepController({
  step,
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
  setDAOName,
  setTokenName,
  setTokenSymbol,
  setTokenSupply,
  setTokenAllocations,
  setProposalThreshold,
  setQuorum,
  setExecutionDelay,
  setLateQuorumExecution,
  setVoteStartDelay,
  setVotingPeriod,
  setPrevEnabled,
  setNextEnabled,
  setDeployEnabled,
}: StepControllerProps) {
  switch (step) {
    case 0:
      return (
        <DAODetails
          setPrevEnabled={setPrevEnabled}
          setNextEnabled={setNextEnabled}
          name={daoName}
          setName={setDAOName}
        />
      );
    case 1:
      return (
        <TokenDetails
          setPrevEnabled={setPrevEnabled}
          setNextEnabled={setNextEnabled}
          name={tokenName}
          setName={setTokenName}
          symbol={tokenSymbol}
          setSymbol={setTokenSymbol}
          supply={tokenSupply}
          setSupply={setTokenSupply}
          tokenAllocations={tokenAllocations}
          setTokenAllocations={setTokenAllocations}
        />
      );
    case 2:
      return (
        <GovernanceDetails
          setDeployEnabled={setDeployEnabled}
          proposalThreshold={proposalThreshold}
          quorum={quorum}
          executionDelay={executionDelay}
          lateQuorumExecution={lateQuorumExecution}
          voteStartDelay={voteStartDelay}
          votingPeriod={votingPeriod}
          setProposalThreshold={setProposalThreshold}
          setQuorum={setQuorum}
          setExecutionDelay={setExecutionDelay}
          setLateQuorumExecution={setLateQuorumExecution}
          setVoteStartDelay={setVoteStartDelay}
          setVotingPeriod={setVotingPeriod}
          setPrevEnabled={setPrevEnabled}
        />
      );
    default:
      return <></>;
  }
}

export default StepController;
