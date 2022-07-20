import DaoCreator from '../../../components/DaoCreator';
import useCreateDAODataCreator from '../../../hooks/useCreateDAODataCreator';
import useCreateProposal from '../../../hooks/useCreateProposal';
import { TokenAllocation } from '../../../types/tokenAllocation';
import { ExecuteData } from '../../../types/execute';
import { useNavigate } from 'react-router-dom';
import { useDAOData } from '../../../contexts/daoData';
import { useBlockchainData } from '../../../contexts/blockchainData';
import { ERC20Funding } from '../../../types/erc20Funding';
import { ERC721Funding } from '../../../types/erc721Funding';
import { useAddresses } from '../../../contexts/daoData/useAddresses';
import { useWeb3Provider } from '../../../contexts/web3Data/hooks/useWeb3Provider';
import {
  TreasuryModule__factory,
  ERC721__factory,
  ERC20__factory,
} from '../../../assets/typechain-types/module-treasury';
import { ethers } from 'ethers';

function Fractalize() {
  const {
    state: { chainId },
  } = useWeb3Provider();

  const addresses = useAddresses(chainId);
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
    votingPeriod: string,
    erc20Funding: ERC20Funding[],
    erc721Funding: ERC721Funding[]
  ) => {
    if (daoAddress === undefined || addresses.treasuryModule === undefined) {
      return;
    }

    const newDAOData = createDAODataCreator({
      creator: daoAddress,
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
        metaFactoryContract.interface.encodeFunctionData('createDAOAndExecute', [
          newDAOData.calldata.daoFactory,
          newDAOData.calldata.createDAOParams,
          newDAOData.calldata.moduleFactories,
          newDAOData.calldata.moduleFactoriesBytes,
          newDAOData.calldata.targets,
          newDAOData.calldata.values,
          newDAOData.calldata.calldatas,
        ]),
      ],
    };

    if (erc20Funding.length > 0) {
      // Approve the new treasury to transfer tokens from the DAO
      erc20Funding.forEach(erc20Fund => {
        data.targets.push(erc20Fund.address);
        data.values.push(0);
        data.calldatas.push(
          ERC20__factory.createInterface().encodeFunctionData('approve', [
            newDAOData.predictedTreasuryAddress,
            ethers.utils.parseUnits(erc20Fund.amount.toString(), 18),
          ])
        );
      });

      // Withdraw tokens from the parent treasury into the parent DAO
      data.targets.push(addresses.treasuryModule.address);
      data.values.push(0);
      data.calldatas.push(
        TreasuryModule__factory.createInterface().encodeFunctionData('withdrawERC20Tokens', [
          erc20Funding.map(erc20Fund => erc20Fund.address),
          new Array(erc20Funding.length).fill(daoAddress),
          erc20Funding.map(erc20Fund => ethers.utils.parseUnits(erc20Fund.amount.toString(), 18)),
        ])
      );

      // Deposit tokens from the parent DAO into the child treasury
      data.targets.push(newDAOData.predictedTreasuryAddress);
      data.values.push(0);
      data.calldatas.push(
        TreasuryModule__factory.createInterface().encodeFunctionData('depositERC20Tokens', [
          erc20Funding.map(erc20Fund => erc20Fund.address),
          new Array(erc20Funding.length).fill(daoAddress),
          erc20Funding.map(erc20Fund => ethers.utils.parseUnits(erc20Fund.amount.toString(), 18)),
        ])
      );
    }

    if (erc721Funding.length > 0) {
      // Approve the new treasury to transfer tokens from the DAO
      erc721Funding.forEach(erc721Fund => {
        data.targets.push(erc721Fund.address);
        data.values.push(0);
        data.calldatas.push(
          ERC721__factory.createInterface().encodeFunctionData('approve', [
            newDAOData.predictedTreasuryAddress,
            erc721Fund.tokenID,
          ])
        );
      });

      // Withdraw tokens from the parent treasury into the parent DAO
      data.targets.push(addresses.treasuryModule.address);
      data.values.push(0);
      data.calldatas.push(
        TreasuryModule__factory.createInterface().encodeFunctionData('withdrawERC721Tokens', [
          erc721Funding.map(erc721Fund => erc721Fund.address),
          new Array(erc721Funding.length).fill(daoAddress),
          erc721Funding.map(erc721Fund => erc721Fund.tokenID),
        ])
      );

      // Deposit tokens from the parent DAO into the child treasury
      data.targets.push(newDAOData.predictedTreasuryAddress);
      data.values.push(0);
      data.calldatas.push(
        TreasuryModule__factory.createInterface().encodeFunctionData('depositERC721Tokens', [
          erc721Funding.map(erc721Fund => erc721Fund.address),
          new Array(erc721Funding.length).fill(daoAddress),
          erc721Funding.map(erc721Fund => erc721Fund.tokenID),
        ])
      );
    }

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
