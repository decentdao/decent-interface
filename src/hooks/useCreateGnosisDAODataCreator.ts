import { useCallback } from 'react';
import { BigNumberish, ethers } from 'ethers';
import { useAddresses } from './useAddresses';
import { useWeb3Provider } from '../contexts/web3Data/hooks/useWeb3Provider';
import { MetaFactoryCreateDAOData } from '../types/metaFactory';
import {
  DAO__factory,
  DAOAccessControl__factory,
  ERC1967Proxy__factory,
} from '@fractal-framework/core-contracts';
import { ERC1967Proxy__factory as GnosisERC1967Proxy__factory } from '../assets/typechain-types/gnosis';
import { ERC1967Proxy__factory as TreasuryERC1967Proxy__factory } from '../assets/typechain-types/module-treasury';
import { TrustedAddress } from '../components/DaoCreator/provider/types';
import { Interface } from 'ethers/lib/utils';
import { getRandomSalt } from '../helpers';

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
        !addresses.treasuryModuleFactory ||
        !addresses.treasuryModule ||
        !addresses.tokenFactory ||
        !addresses.gnosisWrapperFactory ||
        !addresses.gnosisSafeFactory ||
        !addresses.timelock ||
        !addresses.metaFactory ||
        !addresses.gnosisWrapper ||
        !addresses.gnosisSafe
      ) {
        return undefined;
      }

      const daoAndAccessControlSalt = getRandomSalt();
      const treasurySalt = getRandomSalt();
      const gnosisWrapperSalt = getRandomSalt();
      const gnosisSafeSalt = getRandomSalt();

      const predictedDAOAddress = ethers.utils.getCreate2Address(
        addresses.daoFactory.address,
        ethers.utils.solidityKeccak256(
          ['address', 'address', 'uint256', 'bytes32'],
          [creator, addresses.metaFactory.address, chainId, daoAndAccessControlSalt]
        ),
        ethers.utils.solidityKeccak256(
          ['bytes', 'bytes'],
          [
            ERC1967Proxy__factory.bytecode,
            abiCoder.encode(['address', 'bytes'], [addresses.dao.address, []]),
          ]
        )
      );

      const predictedAccessControlAddress = ethers.utils.getCreate2Address(
        addresses.daoFactory.address,
        ethers.utils.solidityKeccak256(
          ['address', 'address', 'uint256', 'bytes32'],
          [creator, addresses.metaFactory.address, chainId, daoAndAccessControlSalt]
        ),
        ethers.utils.solidityKeccak256(
          ['bytes', 'bytes'],
          [
            // eslint-disable-next-line camelcase
            ERC1967Proxy__factory.bytecode,
            abiCoder.encode(['address', 'bytes'], [addresses.accessControl.address, []]),
          ]
        )
      );

      const predictedTreasuryAddress = ethers.utils.getCreate2Address(
        addresses.treasuryModuleFactory.address,
        ethers.utils.solidityKeccak256(
          ['address', 'address', 'uint256', 'bytes32'],
          [creator, addresses.metaFactory.address, chainId, treasurySalt]
        ),
        ethers.utils.solidityKeccak256(
          ['bytes', 'bytes'],
          [
            // eslint-disable-next-line camelcase
            TreasuryERC1967Proxy__factory.bytecode,
            abiCoder.encode(['address', 'bytes'], [addresses.treasuryModule.address, []]),
          ]
        )
      );

      const predictedGnosisWrapperAddress = ethers.utils.getCreate2Address(
        addresses.gnosisWrapperFactory.address,
        ethers.utils.solidityKeccak256(
          ['address', 'address', 'uint256', 'bytes32'],
          [creator, addresses.metaFactory.address, chainId, gnosisWrapperSalt]
        ),
        ethers.utils.solidityKeccak256(
          ['bytes', 'bytes'],
          [
            // eslint-disable-next-line camelcase
            GnosisERC1967Proxy__factory.bytecode,
            abiCoder.encode(['address', 'bytes'], [addresses.gnosisWrapper.address, []]),
          ]
        )
      );

      const gnosisSafeFactoryInterface = new Interface([
        'function createProxyWithNonce(address _singleton, bytes memory initializer, uint256 saltNonce) returns (GnosisSafeProxy proxy)',
      ]);

      const gnosisSafeInterface = new Interface([
        'function setup(address[] calldata _owners,uint256 _threshold,address to,bytes calldata data,address fallbackHandler,address paymentToken,uint256 payment,address payable paymentReceiver)',
      ]);

      const proxyCreationCode =
        '0x608060405234801561001057600080fd5b506040516101e63803806101e68339818101604052602081101561003357600080fd5b8101908080519060200190929190505050600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1614156100ca576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260228152602001806101c46022913960400191505060405180910390fd5b806000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055505060ab806101196000396000f3fe608060405273ffffffffffffffffffffffffffffffffffffffff600054167fa619486e0000000000000000000000000000000000000000000000000000000060003514156050578060005260206000f35b3660008037600080366000845af43d6000803e60008114156070573d6000fd5b3d6000f3fea2646970667358221220d1429297349653a4918076d650332de1a1068c5f3e07c5c82360c277770b955264736f6c63430007060033496e76616c69642073696e676c65746f6e20616464726573732070726f7669646564';

      const createGnosisSetupCalldata = gnosisSafeInterface.encodeFunctionData('setup', [
        trustedAddresses.map(trustedAddress => trustedAddress.address),
        signatureThreshold,
        ethers.constants.AddressZero,
        ethers.constants.HashZero,
        ethers.constants.AddressZero,
        ethers.constants.AddressZero,
        0,
        ethers.constants.AddressZero,
      ]);

      const gnosisSafeFactoryCalldata = gnosisSafeFactoryInterface.encodeFunctionData(
        'createProxyWithNonce',
        [addresses.gnosisSafe.address, createGnosisSetupCalldata, gnosisSafeSalt]
      );

      // @todo check for correct predictions
      const predictedGnosisSafeAddress = ethers.utils.getCreate2Address(
        addresses.gnosisSafeFactory.address,
        ethers.utils.solidityKeccak256(
          ['bytes', 'uint256'],
          [ethers.utils.solidityKeccak256(['bytes'], [gnosisSafeFactoryCalldata]), gnosisSafeSalt]
        ),
        ethers.utils.solidityKeccak256(
          ['bytes', 'uint256'],
          [proxyCreationCode, addresses.gnosisSafe.address]
        )
      );

      const createDAOParams = {
        daoImplementation: addresses.dao.address,
        accessControlImplementation: addresses.accessControl.address,
        daoName: daoName,
        salt: daoAndAccessControlSalt,
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

      const treasuryFactoryCalldata = [
        abiCoder.encode(['address'], [predictedAccessControlAddress]),
        abiCoder.encode(['address'], [addresses.treasuryModule.address]),
        abiCoder.encode(['bytes32'], [treasurySalt]),
      ];

      const gnosisWrapperFactoryCalldata = [
        abiCoder.encode(['address'], [predictedAccessControlAddress]),
        abiCoder.encode(['address'], [addresses.gnosisSafe.address]),
        abiCoder.encode(['address'], [addresses.gnosisWrapper.address]),
        abiCoder.encode(['bytes32'], [gnosisWrapperSalt]),
      ];

      const targetsData = [
        predictedTreasuryAddress,
        predictedTreasuryAddress,
        predictedTreasuryAddress,
        predictedTreasuryAddress,
        predictedTreasuryAddress,
        predictedTreasuryAddress,
        predictedGnosisWrapperAddress,
      ];
      const sigData = [
        'withdrawEth(address[],uint256[])',
        'withdrawERC20Tokens(address[],address[],uint256[])',
        'withdrawERC721Tokens(address[],address[],uint256[])',
        'depositERC20Tokens(address[],address[],uint256[])',
        'depositERC721Tokens(address[],address[],uint256[])',
        'upgradeTo(address)',
        'upgradeTo(address)',
      ];
      const roleData = [
        ['WITHDRAWER_ROLE'],
        ['WITHDRAWER_ROLE'],
        ['WITHDRAWER_ROLE'],
        ['OPEN_ROLE'],
        ['OPEN_ROLE'],
        ['UPGRADE_ROLE'],
        ['UPGRADE_ROLE'],
      ];

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

      const moduleFactories = [
        addresses.treasuryModuleFactory.address,
        addresses.gnosisWrapperFactory.address,
      ];

      const moduleFactoriesBytes = [treasuryFactoryCalldata, gnosisWrapperFactoryCalldata];

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
        predictedTreasuryAddress: predictedTreasuryAddress,
      };
    },
    [
      addresses.dao,
      addresses.daoFactory,
      addresses.accessControl,
      addresses.treasuryModuleFactory,
      addresses.treasuryModule,
      addresses.tokenFactory,
      addresses.timelock,
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
