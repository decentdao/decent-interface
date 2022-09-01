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

export function GnosisGovernanceInjector({ children }: { children: JSX.Element }) {
  const {
    state: { signerOrProvider },
  } = useWeb3Provider();
  const {
    dao: { daoAddress },
  } = useFractal();
  const {
    state: { isSigner },
  } = useGnosisWrapper();

  // const createDAODataCreator = useCreateDAODataCreator();
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
      if (!daoAddress || !signerOrProvider) {
        return;
      }

      const newDAOData = createGnosisDAODataCreator({
        creator: daoAddress,
        ...daoData,
      });

      if (!metaFactoryContract || !newDAOData) {
        return;
      }

      // const data: ExecuteData = {
      //   targets: [metaFactoryContract.address],
      //   values: [0],
      //   calldatas: [
      //     metaFactoryContract.interface.encodeFunctionData('createDAOAndExecute', [
      //       newDAOData.calldata.daoFactory,
      //       newDAOData.calldata.createDAOParams,
      //       newDAOData.calldata.moduleFactories,
      //       newDAOData.calldata.moduleFactoriesBytes,
      //       newDAOData.calldata.targets,
      //       newDAOData.calldata.values,
      //       newDAOData.calldata.calldatas,
      //     ]),
      //   ],
      // };

      // @todo get signature of connected user using the contract transaction hash as the message
      // const signature = await (signerOrProvider as Signer).signMessage(<contractTransactionHash>);

      // @todo object to build data to send request to abi
      // const exeData: TransactionData = {
      //   to: data.targets[0],
      //   value: BigNumber.from(0), // Value in wei
      //   data: data.calldatas[0],
      //   operation: 1, // 0 CALL, 1 DELEGATE_CALL
      //   gasToken: constants.AddressZero, // Token address (hold by the Safe) to be used as a refund to the sender, if `null` is Ether
      //   safeTxGas: 0, // Max gas to use in the transaction
      //   baseGas: 0, // Gast costs not related to the transaction execution (signature check, refund payment...)
      //   gasPrice: 0, // Gas price used for the refund calculation
      //   refundReceiver: constants.AddressZero, //Address of receiver of gas payment (or `null` if tx.origin)
      //   nonce: nonce, // Nonce of the Safe, transaction cannot be executed until Safe's nonce is not equal to this nonce
      //   contractTransactionHash: 'string', // Contract transaction hash calculated from all the field
      //   sender: account, // Owner of the Safe proposing the transaction. Must match one of the signatures
      //   signature: signature, // One or more ethereum ECDSA signatures of the `contractTransactionHash` as an hex string
      //   origin: 'Fractal', // Give more information about the transaction, e.g. "My Custom Safe app"
      // };

      // @todo example request using the buildGnosisGasRelayApiUrl
      // const gasRelayRes = axios.get(buildGnosisGasRelayApiUrl(chainId, '/gas-station/'));

      // @todo if request is successfull call success callback
      //  successCallback()
    },
    [createGnosisDAODataCreator, metaFactoryContract, daoAddress, signerOrProvider]
  );

  const createDAOTrigger = (daoData: TokenGovernanceDAO | GnosisDAO) => {
    switch (daoData.governance) {
      case GovernanceTypes.TOKEN_VOTING_GOVERNANCE:
      // return createTokenVotingDAO(daoData);
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
