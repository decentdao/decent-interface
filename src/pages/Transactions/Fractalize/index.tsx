import { useEffect, useState } from 'react';
import DaoCreator from '../../../components/DaoCreator';
import useCreateDAO from '../../../hooks/useCreateDAO';
import useCreateProposal from '../../../hooks/useCreateProposal';
import { TokenAllocation } from '../../../types/tokenAllocation';
import { ProposalData } from '../../../types/proposal';
import { ExecuteData } from '../../../types/execute';
import { MetaFactory, MetaFactory__factory } from '../../../assets/typechain-types/metafactory';
import { useWeb3Provider } from '../../../contexts/web3Data/hooks/useWeb3Provider';
import { useAddresses } from '../../../contexts/daoData/useAddresses';

function Fractalize() {
  const [pending, setPending] = useState<boolean>(false);
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
  const [daoData, setDAOData] = useState<ExecuteData | undefined>();

  const createDAOData = useCreateDAO({
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

  const [proposalData, setProposalData] = useState<ProposalData>();
  useEffect(() => {
    if (daoData === undefined) {
      console.error('daoData undefined');
      return;
    }

    setProposalData({ ...daoData, description: `New SubDAO: ${daoName}` });
  }, [daoData, daoName]);

  const successCallback = () => {
    console.log('success!');
  };

  const createProposal = useCreateProposal({
    proposalData,
    setPending,
    successCallback,
  });

  const {
    state: { signerOrProvider, chainId },
  } = useWeb3Provider();

  const addresses = useAddresses(chainId);

  const [metaFactory, setMetaFactory] = useState<MetaFactory>();
  useEffect(() => {
    if (addresses.metaFactory === undefined || signerOrProvider === null) {
      setMetaFactory(undefined);
      return;
    }

    setMetaFactory(MetaFactory__factory.connect(addresses.metaFactory.address, signerOrProvider));
  }, [addresses.metaFactory, signerOrProvider]);

  const createDAOTrigger = () => {
    const newDAOData = createDAOData();

    if (metaFactory === undefined) {
      console.error('metafactory is undefined');
      return;
    }

    if (newDAOData === undefined) {
      console.error('newDAOData is undefined');
      return;
    }

    const data: ExecuteData = {
      targets: [metaFactory.address],
      values: [0],
      calldatas: [
        metaFactory.interface.encodeFunctionData('createDAOAndModules', [
          newDAOData.daoFactory,
          newDAOData.metaFactoryTempRoleIndex,
          newDAOData.createDAOParams,
          newDAOData.moduleFactoriesCallData,
          newDAOData.moduleActionData,
          newDAOData.roleModuleMembers,
        ]),
      ],
    };

    setDAOData(data);

    createProposal();
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
