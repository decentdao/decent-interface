import { useNavigate } from 'react-router-dom';
import DaoCreator from '../../components/DaoCreator';
import useDeployDAO from '../../hooks/useDeployDAO';
import { TokenAllocation } from '../../types/tokenAllocation';

function DaoCreate() {
  const navigate = useNavigate();

  const successCallback = (daoAddress: string) => {
    navigate(`/daos/${daoAddress}`);
  };

  const [deploy, pending] = useDeployDAO();

  const deployNewDAO = (
    daoName: string,
    tokenName: string,
    tokenSymbol: string,
    tokenSupply: string,
    tokenAllocations: TokenAllocation[],
    proposalThreshold: string,
    quorum: string,
    executionDelay: string,
    lateQuorumExecution: string,
    voteStartDelay: string,
    votingPeriod: string
  ) => {
    deploy({
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
      successCallback,
    });
  };

  return (
    <DaoCreator
      pending={pending}
      nextTrigger={deployNewDAO}
    />
  );
}

export default DaoCreate;
