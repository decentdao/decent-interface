import DaoCreator from '../../../components/DaoCreator';
import useCreateDAODataCreator from '../../../hooks/useCreateDAODataCreator';
import useCreateProposal from '../../../hooks/useCreateProposal';
import { TokenAllocation } from '../../../types/tokenAllocation';
import { ExecuteData } from '../../../types/execute';
import { useNavigate } from 'react-router-dom';
import { useDAOData } from '../../../contexts/daoData';
import { useBlockchainData } from '../../../contexts/blockchainData';

function Fractalize() {
  const [{ daoAddress }] = useDAOData();
  const navigate = useNavigate();

  const [createProposal, pending] = useCreateProposal();

  const createDAODataCreator = useCreateDAODataCreator();

  const { metaFactoryContract } = useBlockchainData();

  const successCallback = () => {
    if (!daoAddress) {
      return;
    }

    navigate(`/daos/${daoAddress}`);
  };

  const createDAOTrigger = (
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
    if (daoAddress === undefined) {
      return;
    }

    const newDAOData = createDAODataCreator({
      creator: daoAddress,
      daoName,
      tokenName,
      tokenSymbol,
      tokenAllocations,
      proposalThreshold,
      quorum,
      executionDelay,
      lateQuorumExecution,
      voteStartDelay,
      votingPeriod,
    });

    if (!metaFactoryContract || !newDAOData) {
      return;
    }

    const data: ExecuteData = {
      targets: [metaFactoryContract.address],
      values: [0],
      calldatas: [
        metaFactoryContract.interface.encodeFunctionData('createDAOAndExecute', [
          newDAOData.daoFactory,
          newDAOData.createDAOParams,
          newDAOData.moduleFactories,
          newDAOData.moduleFactoriesBytes,
          newDAOData.targets,
          newDAOData.values,
          newDAOData.calldatas,
        ]),
      ],
    };

    createProposal({
      proposalData: { ...data, description: `New subDAO: ${daoName}` },
      successCallback,
    });
  };

  return (
    <DaoCreator
      pending={pending}
      nextLabel="Create subDAO Proposal"
      nextTrigger={createDAOTrigger}
    />
  );
}

export default Fractalize;
