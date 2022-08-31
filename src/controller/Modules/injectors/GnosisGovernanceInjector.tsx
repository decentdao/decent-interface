import React, { useCallback } from 'react';
import {
  GnosisDAO,
  GovernanceTypes,
  TokenGovernanceDAO,
} from '../../../components/DaoCreator/provider/types';
import { useBlockchainData } from '../../../contexts/blockchainData';
import { useWeb3Provider } from '../../../contexts/web3Data/hooks/useWeb3Provider';
import useCreateGnosisDAODataCreator from '../../../hooks/useCreateGnosisDAODataCreator';
import { useFractal } from '../../../providers/fractal/hooks/useFractal';
import { useGnosisWrapper } from '../../../providers/gnosis/hooks/useGnosisWrapper';
import { BigNumber, ethers, Signer } from 'ethers';
import { DAO__factory } from '@fractal-framework/core-contracts';
import { calculateSafeTransactionHash, safeSignMessage } from '../utils';
import axios from 'axios';
import { buildGnosisApiUrl } from '../../../providers/gnosis/helpers';
import { GnosisTransaction, GnosisTransactionAPI } from '../../../providers/gnosis/types/gnosis';
import useCreateDAODataCreator from '../../../hooks/useCreateDAODataCreator';

export interface SafeSignature {
  signer: string;
  data: string;
}

export function GnosisGovernanceInjector({ children }: { children: JSX.Element }) {
  const {
    state: { signerOrProvider, account, chainId },
  } = useWeb3Provider();
  const {
    dao: { daoAddress },
  } = useFractal();
  const {
    state: { isSigner, nonce, contractAddress },
  } = useGnosisWrapper();

  const createDAODataCreator = useCreateDAODataCreator();
  const createGnosisDAODataCreator = useCreateGnosisDAODataCreator();

  const { metaFactoryContract } = useBlockchainData();

  // @todo update this success callback to redirect to Gnosis?
  // const successCallback = useCallback(() => {
  //   if (!daoAddress) {
  //     return;
  //   }
  //   // toast to open tab to gnosis safe
  // }, [daoAddress]);

  const createGnosisDAO = useCallback(
    async (_daoData: TokenGovernanceDAO | GnosisDAO) => {
      const daoData = _daoData as GnosisDAO;
      if (
        !daoAddress ||
        !signerOrProvider ||
        nonce === undefined ||
        !contractAddress ||
        !account ||
        !metaFactoryContract
      ) {
        return;
      }

      const newDAOData = createGnosisDAODataCreator({
        creator: daoAddress,
        ...daoData,
      });

      if (!newDAOData) {
        return;
      }

      const metaFactoryCalldata = metaFactoryContract.interface.encodeFunctionData(
        'createDAOAndExecute',
        [
          newDAOData.calldata.daoFactory,
          newDAOData.calldata.createDAOParams,
          newDAOData.calldata.moduleFactories,
          newDAOData.calldata.moduleFactoriesBytes,
          newDAOData.calldata.targets,
          newDAOData.calldata.values,
          newDAOData.calldata.calldatas,
        ]
      );

      const daoCalldata = DAO__factory.createInterface().encodeFunctionData('execute', [
        [metaFactoryContract.address],
        [BigNumber.from(0)],
        [metaFactoryCalldata],
      ]);

      // Build Gnosis transaction
      const transactionData: GnosisTransaction = {
        to: daoAddress,
        value: BigNumber.from(0), // Value in wei
        data: daoCalldata,
        operation: 0, // 0 CALL, 1 DELEGATE_CALL
        gasToken: ethers.constants.AddressZero, // Token address (hold by the Safe) to be used as a refund to the sender, if `null` is Ether
        safeTxGas: BigNumber.from(0), // Max gas to use in the transaction
        baseGas: BigNumber.from(0), // Gas costs not related to the transaction execution (signature check, refund payment...)
        gasPrice: BigNumber.from(0), // Gas price used for the refund calculation
        refundReceiver: ethers.constants.AddressZero, //Address of receiver of gas payment (or `null` if tx.origin)
        nonce: nonce, // Nonce of the Safe, transaction cannot be executed until Safe's nonce is not equal to this nonce
      };

      const signature = await safeSignMessage(
        signerOrProvider as Signer,
        contractAddress,
        transactionData
      );

      const contractTransactionHash = calculateSafeTransactionHash(
        contractAddress,
        transactionData,
        chainId
      );

      const apiTransactionData: GnosisTransactionAPI = {
        to: daoAddress,
        value: '0', // Value in wei
        data: daoCalldata,
        operation: 0, // 0 CALL, 1 DELEGATE_CALL
        gasToken: ethers.constants.AddressZero, // Token address (hold by the Safe) to be used as a refund to the sender, if `null` is Ether
        safeTxGas: 0, // Max gas to use in the transaction
        baseGas: 0, // Gas costs not related to the transaction execution (signature check, refund payment...)
        gasPrice: 0, // Gas price used for the refund calculation
        refundReceiver: ethers.constants.AddressZero, //Address of receiver of gas payment (or `null` if tx.origin)
        nonce: nonce, // Nonce of the Safe, transaction cannot be executed until Safe's nonce is not equal to this nonce
        contractTransactionHash: contractTransactionHash, // Contract transaction hash calculated from all the field
        sender: account, // Owner of the Safe proposing the transaction. Must match one of the signatures
        signature: signature.data, // One or more ethereum ECDSA signatures of the `contractTransactionHash` as an hex string
        origin: 'Fractal', // Give more information about the transaction, e.g. "My Custom Safe app"
      };

      // @todo example request using the buildGnosisGasRelayApiUrl
      // const gasRelayRes = axios.get(buildGnosisGasRelayApiUrl(chainId, '/gas-station/'));

      // @todo if request is successfull call success callback
      //  successCallback()

      try {
        // todo: Add in check for 200 (failed) vs 201 (success)
        const res = await axios.post(
          buildGnosisApiUrl(chainId, `/safes/${contractAddress}/multisig-transactions/`),
          apiTransactionData
        );
        if (res.status === 201) {
          console.log('transaction succeeded');
        } else {
          console.log('transaction failed');
        }
      } catch (e) {
        console.log(e);
      }
    },
    [
      createGnosisDAODataCreator,
      metaFactoryContract,
      daoAddress,
      signerOrProvider,
      contractAddress,
      nonce,
      account,
      chainId,
    ]
  );

  const createTokenVotingDAO = useCallback(
    async (_daoData: TokenGovernanceDAO | GnosisDAO) => {
      const daoData = _daoData as TokenGovernanceDAO;
      if (
        !daoAddress ||
        !signerOrProvider ||
        nonce === undefined ||
        !contractAddress ||
        !account ||
        !metaFactoryContract
      ) {
        return;
      }

      const newDAOData = createDAODataCreator({
        creator: daoAddress,
        ...daoData,
      });

      if (!newDAOData) {
        return;
      }

      const metaFactoryCalldata = metaFactoryContract.interface.encodeFunctionData(
        'createDAOAndExecute',
        [
          newDAOData.calldata.daoFactory,
          newDAOData.calldata.createDAOParams,
          newDAOData.calldata.moduleFactories,
          newDAOData.calldata.moduleFactoriesBytes,
          newDAOData.calldata.targets,
          newDAOData.calldata.values,
          newDAOData.calldata.calldatas,
        ]
      );

      const daoCalldata = DAO__factory.createInterface().encodeFunctionData('execute', [
        [metaFactoryContract.address],
        [BigNumber.from(0)],
        [metaFactoryCalldata],
      ]);

      // Build Gnosis transaction
      const transactionData: GnosisTransaction = {
        to: daoAddress,
        value: BigNumber.from(0), // Value in wei
        data: daoCalldata,
        operation: 0, // 0 CALL, 1 DELEGATE_CALL
        gasToken: ethers.constants.AddressZero, // Token address (hold by the Safe) to be used as a refund to the sender, if `null` is Ether
        safeTxGas: BigNumber.from(0), // Max gas to use in the transaction
        baseGas: BigNumber.from(0), // Gas costs not related to the transaction execution (signature check, refund payment...)
        gasPrice: BigNumber.from(0), // Gas price used for the refund calculation
        refundReceiver: ethers.constants.AddressZero, //Address of receiver of gas payment (or `null` if tx.origin)
        nonce: nonce, // Nonce of the Safe, transaction cannot be executed until Safe's nonce is not equal to this nonce
      };

      const signature = await safeSignMessage(
        signerOrProvider as Signer,
        contractAddress,
        transactionData
      );

      const contractTransactionHash = calculateSafeTransactionHash(
        contractAddress,
        transactionData,
        chainId
      );

      const apiTransactionData: GnosisTransactionAPI = {
        to: daoAddress,
        value: '0', // Value in wei
        data: daoCalldata,
        operation: 0, // 0 CALL, 1 DELEGATE_CALL
        gasToken: ethers.constants.AddressZero, // Token address (hold by the Safe) to be used as a refund to the sender, if `null` is Ether
        safeTxGas: 0, // Max gas to use in the transaction
        baseGas: 0, // Gas costs not related to the transaction execution (signature check, refund payment...)
        gasPrice: 0, // Gas price used for the refund calculation
        refundReceiver: ethers.constants.AddressZero, //Address of receiver of gas payment (or `null` if tx.origin)
        nonce: nonce, // Nonce of the Safe, transaction cannot be executed until Safe's nonce is not equal to this nonce
        contractTransactionHash: contractTransactionHash, // Contract transaction hash calculated from all the field
        sender: account, // Owner of the Safe proposing the transaction. Must match one of the signatures
        signature: signature.data, // One or more ethereum ECDSA signatures of the `contractTransactionHash` as an hex string
        origin: 'Fractal', // Give more information about the transaction, e.g. "My Custom Safe app"
      };

      // @todo example request using the buildGnosisGasRelayApiUrl
      // const gasRelayRes = axios.get(buildGnosisGasRelayApiUrl(chainId, '/gas-station/'));

      // @todo if request is successfull call success callback
      //  successCallback()

      try {
        // todo: Add in check for 200 (failed) vs 201 (success)
        const res = await axios.post(
          buildGnosisApiUrl(chainId, `/safes/${contractAddress}/multisig-transactions/`),
          apiTransactionData
        );
        if (res.status === 201) {
          console.log('transaction succeeded');
        } else {
          console.log('transaction failed');
        }
      } catch (e) {
        console.log(e);
      }
    },
    [
      daoAddress,
      signerOrProvider,
      nonce,
      contractAddress,
      account,
      metaFactoryContract,
      createDAODataCreator,
      chainId,
    ]
  );

  const createDAOTrigger = (daoData: TokenGovernanceDAO | GnosisDAO) => {
    switch (daoData.governance) {
      case GovernanceTypes.TOKEN_VOTING_GOVERNANCE:
        return createTokenVotingDAO(daoData);
      case GovernanceTypes.GNOSIS_SAFE:
        return createGnosisDAO(daoData);
    }
  };

  return React.cloneElement(children, {
    createDAOTrigger,
    createProposal: () => {},
    pending: false,
    isAuthorized: isSigner,
  });
}
