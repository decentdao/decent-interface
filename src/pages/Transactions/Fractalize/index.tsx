import { useState } from 'react';
import DaoCreator from '../../../components/DaoCreator';
import useCreateDAODataCreator from '../../../hooks/useCreateDAODataCreator';
import useCreateProposal from '../../../hooks/useCreateProposal';
import { TokenAllocation } from '../../../types/tokenAllocation';
import { ExecuteData } from '../../../types/execute';
import { useNavigate } from 'react-router-dom';
import { useDAOData } from '../../../contexts/daoData';
import { useBlockchainData } from '../../../contexts/blockchainData';

function Fractalize() {
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

  const createDAOTrigger = () => {
    const newDAOData = createDAODataCreator({
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

    if (!metaFactoryContract || !newDAOData) {
      return;
    }

    const data: ExecuteData = {
      targets: [metaFactoryContract.address],
      values: [0],
      calldatas: [
        metaFactoryContract.interface.encodeFunctionData('createDAOAndModules', [
          newDAOData.daoFactory,
          newDAOData.metaFactoryTempRoleIndex,
          newDAOData.createDAOParams,
          newDAOData.moduleFactoriesCallData,
          newDAOData.moduleActionData,
          newDAOData.roleModuleMembers,
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
      nextLabel="Create subDAO Proposal"
      nextTrigger={createDAOTrigger}
    />
  );
}

export default Fractalize;
