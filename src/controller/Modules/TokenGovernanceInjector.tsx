import { ethers } from 'ethers';
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ERC20__factory,
  TreasuryModule__factory,
  ERC721__factory,
} from '../../assets/typechain-types/module-treasury';
import {
  GnosisDAO,
  GovernanceTypes,
  TokenGovernanceDAO,
} from '../../components/DaoCreator/provider/types';
import { useBlockchainData } from '../../contexts/blockchainData';
import useCreateDAODataCreator from '../../hooks/useCreateDAODataCreator';
import useCreateGnosisDAODataCreator from '../../hooks/useCreateGnosisDAODataCreator';
import { useFractal } from '../../providers/fractal/hooks/useFractal';
import { useGovenorModule } from '../../providers/govenor/hooks/useGovenorModule';
import { useUserProposalValidation } from '../../providers/govenor/hooks/useUserProposalValidation';
import { useTreasuryModule } from '../../providers/treasury/hooks/useTreasuryModule';
import { ExecuteData } from '../../types/execute';

/**
 * Handles passing 'createProposal' to plugins for this module
 * Each Governor module should have it's own injector to pull information from context provider to pass to the Plugins
 */
export function GovernanceInjector({ children }: { children: JSX.Element }) {
  const {
    dao: { daoAddress },
  } = useFractal();

  const {
    createProposal: { pendingCreateTx, submitProposal },
    votingToken,
    governorModuleContract,
  } = useGovenorModule();
  const { treasuryModuleContract } = useTreasuryModule();

  const canUserCreateProposal = useUserProposalValidation();

  const createDAODataCreator = useCreateDAODataCreator();
  const createGnosisDAODataCreator = useCreateGnosisDAODataCreator();

  const { metaFactoryContract } = useBlockchainData();
  const navigate = useNavigate();
  const successCallback = useCallback(() => {
    if (!daoAddress || !governorModuleContract) {
      return;
    }

    navigate(`/daos/${daoAddress}/modules/${governorModuleContract.address}`);
  }, [daoAddress, governorModuleContract, navigate]);

  const createTokenVotingDAO = useCallback(
    (_daoData: TokenGovernanceDAO | GnosisDAO) => {
      const daoData = _daoData as TokenGovernanceDAO;
      if (!daoAddress || !treasuryModuleContract || !votingToken) {
        return;
      }

      const newDAOData = createDAODataCreator(
        {
          creator: daoAddress,
          ...daoData,
        },
        votingToken.votingTokenData.address
      );

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

            // Withdraw tokens from the parent treasury into the parent DAO
            data.targets.push(treasuryModuleContract.address);
            data.values.push(0);
            data.calldatas.push(
              TreasuryModule__factory.createInterface().encodeFunctionData('withdrawERC20Tokens', [
                [tokenToFund.asset.contractAddress],
                [daoAddress],
                [
                  ethers.utils.parseUnits(
                    tokenToFund.amount.toString(),
                    tokenToFund.asset.decimals
                  ),
                ],
              ])
            );

            // Deposit tokens from the parent DAO into the child treasury
            data.targets.push(newDAOData.predictedTreasuryAddress);
            data.values.push(0);
            data.calldatas.push(
              TreasuryModule__factory.createInterface().encodeFunctionData('depositERC20Tokens', [
                [tokenToFund.asset.contractAddress],
                [daoAddress],
                [
                  ethers.utils.parseUnits(
                    tokenToFund.amount.toString(),
                    tokenToFund.asset.decimals
                  ),
                ],
              ])
            );
          } else {
            // ETH Transfer
            // Withdraw ETH from the parent treasury into the parent DAO
            data.targets.push(treasuryModuleContract.address);
            data.values.push(0);
            data.calldatas.push(
              TreasuryModule__factory.createInterface().encodeFunctionData('withdrawEth', [
                [newDAOData.predictedTreasuryAddress],
                [
                  ethers.utils.parseUnits(
                    tokenToFund.amount.toString(),
                    tokenToFund.asset.decimals
                  ),
                ],
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
        data.targets.push(treasuryModuleContract.address);
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
      submitProposal({
        proposalData: { ...data, description: `New subDAO: ${daoData.daoName}` },
        successCallback,
      });
    },
    [
      submitProposal,
      createDAODataCreator,
      metaFactoryContract,
      daoAddress,
      successCallback,
      treasuryModuleContract,
      votingToken,
    ]
  );

  const createGnosisDAO = useCallback(
    (_daoData: TokenGovernanceDAO | GnosisDAO) => {
      const daoData = _daoData as GnosisDAO;
      if (!daoAddress) {
        return;
      }

      const newDAOData = createGnosisDAODataCreator({
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

      submitProposal({
        proposalData: { ...data, description: `New subDAO: ${daoData.daoName}` },
        successCallback,
      });
    },
    [submitProposal, createGnosisDAODataCreator, metaFactoryContract, daoAddress, successCallback]
  );

  const createDAOTrigger = (daoData: TokenGovernanceDAO | GnosisDAO) => {
    switch (daoData.governance) {
      case GovernanceTypes.TOKEN_VOTING_GOVERNANCE:
        return createTokenVotingDAO(daoData);
      case GovernanceTypes.GNOSIS_SAFE:
        return createGnosisDAO(daoData);
    }
  };

  if (!governorModuleContract) {
    return null;
  }

  return React.cloneElement(children, {
    createDAOTrigger,
    createProposal: submitProposal,
    pending: pendingCreateTx,
    isAuthorized: canUserCreateProposal,
  });
}
