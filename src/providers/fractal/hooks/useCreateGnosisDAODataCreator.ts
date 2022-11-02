import { useCallback } from 'react';
import { BigNumber, BigNumberish, ethers } from 'ethers';
import { useAddresses } from '../../../hooks/useAddresses';
import { useWeb3Provider } from '../../../contexts/web3Data/hooks/useWeb3Provider';
import { MetaFactoryCreateDAOData } from '../../../types/metaFactory';
import {
  DAO__factory,
  DAOAccessControl__factory,
  ERC1967Proxy__factory,
} from '@fractal-framework/core-contracts';
import { ERC1967Proxy__factory as GnosisERC1967Proxy__factory } from '../../../assets/typechain-types/gnosis-wrapper';
import { TrustedAddress } from '../../../components/DaoCreator/provider/types';
import { Interface } from 'ethers/lib/utils';
import { getRandomBytes } from '../../../helpers';

const useCreateGnosisDAODataCreator = () => {
  const {
    state: { chainId },
  } = useWeb3Provider();

  const addresses = useAddresses(chainId);

  const createDAOData = useCallback(
    ({
      creator,
      daoName,
      trustedAddresses,
      signatureThreshold,
    }: {
      creator: string;
      daoName: string;
      trustedAddresses: TrustedAddress[];
      signatureThreshold: string;
    }) => {
      const abiCoder = new ethers.utils.AbiCoder();

      if (
        !addresses.dao ||
        !addresses.daoFactory ||
        !addresses.accessControl ||
        !addresses.gnosisWrapperFactory ||
        !addresses.gnosisSafeFactory ||
        !addresses.metaFactory ||
        !addresses.gnosisWrapper ||
        !addresses.gnosisSafe
      ) {
        return undefined;
      }
      const daoAndAccessControlNonce = getRandomBytes();
      const gnosisWrapperNonce = getRandomBytes();
      const gnosisSafeNonce = getRandomBytes();

      // DAO AND ACCESS CONTROL

      const daoAndAccessControlSalt = ethers.utils.solidityKeccak256(
        ['address', 'address', 'uint256', 'bytes32'],
        [creator, addresses.metaFactory.address, chainId, daoAndAccessControlNonce]
      );

      const daoInitCode = ethers.utils.solidityKeccak256(
        ['bytes', 'bytes'],
        [
          ERC1967Proxy__factory.bytecode,
          abiCoder.encode(['address', 'bytes'], [addresses.dao.address, []]),
        ]
      );

      const predictedDAOAddress = ethers.utils.getCreate2Address(
        addresses.daoFactory.address,
        daoAndAccessControlSalt,
        daoInitCode
      );

      const accessControlInitCode = ethers.utils.solidityKeccak256(
        ['bytes', 'bytes'],
        [
          // eslint-disable-next-line camelcase
          ERC1967Proxy__factory.bytecode,
          abiCoder.encode(['address', 'bytes'], [addresses.accessControl.address, []]),
        ]
      );
      const predictedAccessControlAddress = ethers.utils.getCreate2Address(
        addresses.daoFactory.address,
        daoAndAccessControlSalt,
        accessControlInitCode
      );

      // GNOSIS WRAPPER AND GNOSIS SAFE

      const gnosisWrapperSalt = ethers.utils.solidityKeccak256(
        ['address', 'address', 'uint256', 'bytes32'],
        [creator, addresses.metaFactory.address, chainId, gnosisWrapperNonce]
      );

      const gnosisWrapperInitCode = ethers.utils.solidityKeccak256(
        ['bytes', 'bytes'],
        [
          // eslint-disable-next-line camelcase
          GnosisERC1967Proxy__factory.bytecode,
          abiCoder.encode(['address', 'bytes'], [addresses.gnosisWrapper.address, []]),
        ]
      );

      const predictedGnosisWrapperAddress = ethers.utils.getCreate2Address(
        addresses.gnosisWrapperFactory.address,
        gnosisWrapperSalt,
        gnosisWrapperInitCode
      );

      const gnosisSafeFactoryInterface = new Interface([
        'function createProxyWithNonce(address _mastercopy, bytes memory initializer, uint256 saltNonce) returns (GnosisSafeProxy proxy)',
      ]);

      const gnosisSafeInterface = new Interface([
        'function setup(address[] calldata _owners,uint256 _threshold,address to,bytes calldata data,address fallbackHandler,address paymentToken,uint256 payment,address payable paymentReceiver)',
      ]);

      const proxyCreationCode =
        '0x608060405234801561001057600080fd5b506040516101e63803806101e68339818101604052602081101561003357600080fd5b8101908080519060200190929190505050600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1614156100ca576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260228152602001806101c46022913960400191505060405180910390fd5b806000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055505060ab806101196000396000f3fe608060405273ffffffffffffffffffffffffffffffffffffffff600054167fa619486e0000000000000000000000000000000000000000000000000000000060003514156050578060005260206000f35b3660008037600080366000845af43d6000803e60008114156070573d6000fd5b3d6000f3fea2646970667358221220d1429297349653a4918076d650332de1a1068c5f3e07c5c82360c277770b955264736f6c63430007060033496e76616c69642073696e676c65746f6e20616464726573732070726f7669646564';

      const createGnosisSetupCalldata = gnosisSafeInterface.encodeFunctionData('setup', [
        trustedAddresses.map(trustedAddress => trustedAddress.address), // _owners
        signatureThreshold, // signing threshold
        ethers.constants.AddressZero, // to - Contract address for optional delegate call.
        ethers.constants.HashZero, // data - Data payload for optional delegate call.
        ethers.constants.AddressZero, // fallbackHandler
        ethers.constants.AddressZero, // paymentToken
        BigNumber.from(0), // payment
        ethers.constants.AddressZero, // paymentReceiver
      ]);

      const gnosisSafeFactoryCalldata = gnosisSafeFactoryInterface.encodeFunctionData(
        'createProxyWithNonce',
        [addresses.gnosisSafe.address, createGnosisSetupCalldata, gnosisSafeNonce]
      );

      const gnosisSalt = ethers.utils.solidityKeccak256(
        ['bytes32', 'uint256'],
        [ethers.utils.solidityKeccak256(['bytes'], [createGnosisSetupCalldata]), gnosisSafeNonce]
      );

      const gnosisInitCode = ethers.utils.solidityKeccak256(
        ['bytes', 'uint256'],
        [proxyCreationCode, addresses.gnosisSafe.address]
      );

      const predictedGnosisSafeAddress = ethers.utils.getCreate2Address(
        addresses.gnosisSafeFactory.address,
        gnosisSalt,
        gnosisInitCode
      );

      const createDAOParams = {
        daoImplementation: addresses.dao.address,
        accessControlImplementation: addresses.accessControl.address,
        daoName: daoName,
        salt: daoAndAccessControlNonce,
        roles: ['EXECUTE_ROLE', 'UPGRADE_ROLE', 'WITHDRAWER_ROLE'],
        rolesAdmins: ['DAO_ROLE', 'DAO_ROLE', 'DAO_ROLE'],
        members: [
          [predictedGnosisSafeAddress, addresses.metaFactory.address],
          [predictedDAOAddress],
          [predictedDAOAddress],
        ],
        daoFunctionDescs: ['execute(address[],uint256[],bytes[])', 'upgradeTo(address)'],
        daoActionRoles: [['EXECUTE_ROLE'], ['UPGRADE_ROLE']],
      };
      const gnosisWrapperFactoryCalldata = [
        abiCoder.encode(['address'], [predictedAccessControlAddress]),
        abiCoder.encode(['address'], [predictedGnosisSafeAddress]),
        abiCoder.encode(['address'], [addresses.gnosisWrapper.address]),
        abiCoder.encode(['bytes32'], [gnosisWrapperNonce]),
      ];

      const targetsData = [predictedGnosisWrapperAddress];
      const sigData = ['upgradeTo(address)'];
      const roleData = [['UPGRADE_ROLE']];

      const addActionsRolesCalldata = DAO__factory.createInterface().encodeFunctionData('execute', [
        [predictedAccessControlAddress],
        [0],
        [
          DAOAccessControl__factory.createInterface().encodeFunctionData('daoAddActionsRoles', [
            targetsData,
            sigData,
            roleData,
          ]),
        ],
      ]);

      const revokeMetafactoryRoleCalldata =
        DAOAccessControl__factory.createInterface().encodeFunctionData('userRenounceRole', [
          'EXECUTE_ROLE',
          addresses.metaFactory.address,
        ]);

      const moduleFactories = [addresses.gnosisWrapperFactory.address];

      const moduleFactoriesBytes = [gnosisWrapperFactoryCalldata];

      const targets: string[] = [
        addresses.gnosisSafeFactory.address,
        predictedDAOAddress,
        predictedAccessControlAddress,
      ];

      const values: BigNumberish[] = [0, 0, 0];

      const calldatas: string[] = [
        gnosisSafeFactoryCalldata, // Call the Gnosis Safe factory to create the Gnosis Safe proxy
        addActionsRolesCalldata, // Setup module action role configurations
        revokeMetafactoryRoleCalldata, // Revoke the Metafactory's execute role
      ];

      return {
        calldata: {
          daoFactory: addresses.daoFactory.address,
          createDAOParams: createDAOParams,
          moduleFactories: moduleFactories,
          moduleFactoriesBytes: moduleFactoriesBytes,
          targets: targets,
          values: values,
          calldatas: calldatas,
        } as MetaFactoryCreateDAOData,
        predictedDAOAddress,
      };
    },
    [
      addresses.dao,
      addresses.daoFactory,
      addresses.accessControl,
      addresses.metaFactory,
      addresses.gnosisSafe,
      addresses.gnosisSafeFactory,
      addresses.gnosisWrapper,
      addresses.gnosisWrapperFactory,
      chainId,
    ]
  );

  return createDAOData;
};

export default useCreateGnosisDAODataCreator;
