import DaoCreator from '../../../components/DaoCreator';
import useCreateDAODataCreator from '../../../hooks/useCreateDAODataCreator';
import useCreateProposal from '../../../hooks/useCreateProposal';
import { ExecuteData } from '../../../types/execute';
import { useNavigate } from 'react-router-dom';
import { useDAOData } from '../../../contexts/daoData';
import { useBlockchainData } from '../../../contexts/blockchainData';
import { DAODeployData } from '../../../components/DaoCreator/provider/types';
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

  const createDAOTrigger = (daoData: DAODeployData) => {
    console.log('🚀 ~ file: index.tsx ~ line 42 ~ daoData', daoData);
    if (
      daoAddress === undefined ||
      addresses === undefined ||
      addresses.treasuryModule === undefined ||
      addresses.treasuryModule.address === undefined
    ) {
      return;
    }

    const newDAOData = createDAODataCreator({
      creator: daoAddress,
      ...daoData,
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

    const treasuryModuleAddress = addresses.treasuryModule!.address;

    if (daoData.tokensToFund.length > 0) {
      daoData.tokensToFund.forEach(tokenToFund => {
        if (tokenToFund.asset.contractAddress !== ethers.constants.AddressZero) {
          // ERC20 transfer
          // Approve the new treasury to transfer tokens from the DAO
          data.targets.push(tokenToFund.asset.contractAddress);
          data.values.push(0);
          data.calldatas.push(
            ERC20__factory.createInterface().encodeFunctionData('approve', [
              newDAOData.predictedTreasuryAddress,
              ethers.utils.parseUnits(tokenToFund.amount.toString(), tokenToFund.asset.decimals),
            ])
          );

          // Deposit tokens from the parent DAO into the child treasury
          data.targets.push(newDAOData.predictedTreasuryAddress);
          data.values.push(0);
          data.calldatas.push(
            TreasuryModule__factory.createInterface().encodeFunctionData('depositERC20Tokens', [
              [tokenToFund.asset.contractAddress],
              [daoAddress],
              [ethers.utils.parseUnits(tokenToFund.amount.toString(), tokenToFund.asset.decimals)],
            ])
          );

          // Withdraw tokens from the parent treasury into the parent DAO
          data.targets.push(treasuryModuleAddress);
          data.values.push(0);
          data.calldatas.push(
            TreasuryModule__factory.createInterface().encodeFunctionData('withdrawERC20Tokens', [
              [tokenToFund.asset.contractAddress],
              [daoAddress],
              [ethers.utils.parseUnits(tokenToFund.amount.toString(), tokenToFund.asset.decimals)],
            ])
          );

          // Deposit tokens from the parent DAO into the child treasury
          data.targets.push(newDAOData.predictedTreasuryAddress);
          data.values.push(0);
          data.calldatas.push(
            TreasuryModule__factory.createInterface().encodeFunctionData('depositERC20Tokens', [
              [tokenToFund.asset.contractAddress],
              [daoAddress],
              [ethers.utils.parseUnits(tokenToFund.amount.toString(), tokenToFund.asset.decimals)],
            ])
          );
        } else {
          // ETH Transfer
          // Withdraw ETH from the parent treasury into the parent DAO
          data.targets.push(treasuryModuleAddress);
          data.values.push(0);
          data.calldatas.push(
            TreasuryModule__factory.createInterface().encodeFunctionData('withdrawEth', [
              [newDAOData.predictedTreasuryAddress],
              [ethers.utils.parseUnits(tokenToFund.amount.toString(), tokenToFund.asset.decimals)],
            ])
          );
        }
      });
    }

    if (daoData.nftsToFund.length > 0) {
      // Approve the new treasury to transfer tokens from the DAO
      daoData.nftsToFund.forEach(erc721Fund => {
        data.targets.push(erc721Fund.asset.contractAddress);
        data.values.push(0);
        data.calldatas.push(
          ERC721__factory.createInterface().encodeFunctionData('approve', [
            newDAOData.predictedTreasuryAddress,
            erc721Fund.asset.tokenId,
          ])
        );
      });

      // Withdraw tokens from the parent treasury into the parent DAO
      data.targets.push(treasuryModuleAddress);
      data.values.push(0);
      data.calldatas.push(
        TreasuryModule__factory.createInterface().encodeFunctionData('withdrawERC721Tokens', [
          daoData.nftsToFund.map(erc721Fund => erc721Fund.asset.contractAddress),
          new Array(daoData.nftsToFund.length).fill(daoAddress),
          daoData.nftsToFund.map(erc721Fund => erc721Fund.asset.tokenId),
        ])
      );

      // Deposit tokens from the parent DAO into the child treasury
      data.targets.push(newDAOData.predictedTreasuryAddress);
      data.values.push(0);
      data.calldatas.push(
        TreasuryModule__factory.createInterface().encodeFunctionData('depositERC721Tokens', [
          daoData.nftsToFund.map(erc721Fund => erc721Fund.asset.contractAddress),
          new Array(daoData.nftsToFund.length).fill(daoAddress),
          daoData.nftsToFund.map(erc721Fund => erc721Fund.asset.tokenId),
        ])
      );
    }

    createProposal({
      proposalData: { ...data, description: `New subDAO: ${daoData.daoName}` },
      successCallback,
    });
  };

  return (
    <DaoCreator
      pending={pending}
      nextTrigger={createDAOTrigger}
      isSubDAO
    />
  );
}

export default Fractalize;
