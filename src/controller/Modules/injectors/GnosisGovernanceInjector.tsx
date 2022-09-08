import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BigNumber, ethers, Signer } from 'ethers';
import axios from 'axios';
import { toast } from 'react-toastify';
import { DAO__factory } from '@fractal-framework/core-contracts';
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
import {
  calculateSafeTransactionHash,
  safeSignMessage,
  buildGnosisApiUrl,
} from '../../../providers/gnosis/helpers';
import { GnosisTransaction, GnosisTransactionAPI } from '../../../providers/gnosis/types/gnosis';
import useCreateDAODataCreator from '../../../hooks/useCreateDAODataCreator';

export function GnosisGovernanceInjector({ children }: { children: JSX.Element }) {
  const {
    state: { signerOrProvider, account, chainId },
  } = useWeb3Provider();
  const {
    dao: { daoAddress },
    modules: { gnosisWrapperModule },
  } = useFractal();
  const {
    state: { isSigner, nonce, safeAddress },
  } = useGnosisWrapper();
  const [pending, setPending] = useState(false);

  const createDAODataCreator = useCreateDAODataCreator();
  const createGnosisDAODataCreator = useCreateGnosisDAODataCreator();

  const { metaFactoryContract } = useBlockchainData();

  const navigate = useNavigate();
  const successCallback = useCallback(() => {
    if (!daoAddress || !gnosisWrapperModule) {
      return;
    }

    navigate(`/daos/${daoAddress}/modules/${gnosisWrapperModule.moduleAddress}`);
  }, [daoAddress, gnosisWrapperModule, navigate]);

  const createDAO = useCallback(
    async (_daoData: TokenGovernanceDAO | GnosisDAO) => {
      if (
        !daoAddress ||
        !signerOrProvider ||
        nonce === undefined ||
        !safeAddress ||
        !account ||
        !metaFactoryContract
      ) {
        return;
      }

      setPending(true);

      let newDAOData;
      if (_daoData.governance === GovernanceTypes.TOKEN_VOTING_GOVERNANCE) {
        newDAOData = createDAODataCreator({
          creator: daoAddress,
          ...(_daoData as TokenGovernanceDAO),
        });
      } else {
        newDAOData = createGnosisDAODataCreator({
          creator: daoAddress,
          ...(_daoData as GnosisDAO),
        });
      }

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

      const sigToastId = toast('Please sign Gnosis transaction', {
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        progress: 1,
      });

      const signature = await safeSignMessage(
        signerOrProvider as Signer,
        safeAddress,
        transactionData
      );

      toast.dismiss(sigToastId);

      if (!signature.data) {
        setPending(false);
        toast.error("There was an error! Check your browser's console logs for more details.");
        return;
      }

      const contractTransactionHash = calculateSafeTransactionHash(
        safeAddress,
        transactionData,
        chainId
      );
      const apiTransactionData: GnosisTransactionAPI = {
        to: daoAddress,
        value: '0', // Value in wei
        data: daoCalldata,
        operation: 0, // 0 CALL, 1 DELEGATE_CALL
        gasToken: null, // Token address (hold by the Safe) to be used as a refund to the sender, if `null` is Ether
        safeTxGas: 0, // Max gas to use in the transaction
        baseGas: 0, // Gas costs not related to the transaction execution (signature check, refund payment...)
        gasPrice: 0, // Gas price used for the refund calculation
        refundReceiver: null, //Address of receiver of gas payment (or `null` if tx.origin)
        nonce: nonce, // Nonce of the Safe, transaction cannot be executed until Safe's nonce is not equal to this nonce
        contractTransactionHash: contractTransactionHash, // Contract transaction hash calculated from all the field
        sender: account, // Owner of the Safe proposing the transaction. Must match one of the signatures
        signature: signature.data, // One or more ethereum ECDSA signatures of the `contractTransactionHash` as an hex string
        origin: 'Gnosis Safe created via Fractal Framework', // Give more information about the transaction, e.g. "My Custom Safe app"
      };

      try {
        const res = await axios.post(
          buildGnosisApiUrl(chainId, `/safes/${safeAddress}/multisig-transactions/`),
          apiTransactionData
        );
        setPending(false);
        if (res.status === 201) {
          toast('Transaction signed and posted to Gnosis');
          successCallback();
        } else {
          console.error(res);
          toast("There was an error! Check your browser's console logs for more details.");
        }
      } catch (e) {
        console.error(e);
        toast("There was an error! Check your browser's console logs for more details.");
      }
    },
    [
      daoAddress,
      signerOrProvider,
      nonce,
      safeAddress,
      account,
      metaFactoryContract,
      chainId,
      createDAODataCreator,
      createGnosisDAODataCreator,
      successCallback,
    ]
  );

  const createDAOTrigger = (daoData: TokenGovernanceDAO | GnosisDAO) => {
    createDAO(daoData);
  };

  return React.cloneElement(children, {
    createDAOTrigger,
    createProposal: () => {},
    pending: pending,
    isAuthorized: isSigner,
  });
}
