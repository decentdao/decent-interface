import { GnosisSafeProxyFactory } from '@fractal-framework/fractal-contracts';
import {
  getCreate2Address,
  zeroAddress,
  zeroHash,
  keccak256,
  encodePacked,
  Address,
  Hash,
  encodeFunctionData,
} from 'viem';
import SafeL2ABI from '../../assets/abi/SafeL2';
import { MultiSend } from '../../assets/typechain-types/usul';
import { GnosisSafeL2 } from '../../assets/typechain-types/usul/@gnosis.pm/safe-contracts/contracts';
import { buildContractCall } from '../../helpers/crypto';
import { SafeMultisigDAO } from '../../types';

export const safeData = async (
  multiSendContract: MultiSend,
  safeFactoryContract: GnosisSafeProxyFactory,
  safeSingletonContract: GnosisSafeL2,
  daoData: SafeMultisigDAO,
  saltNum: string,
  fallbackHandler: string,
  hasAzorius?: boolean,
) => {
  const signers = hasAzorius
    ? [multiSendContract.address]
    : [
        ...daoData.trustedAddresses.map(trustedAddress => trustedAddress),
        multiSendContract.address,
      ];

  const createSafeCalldata = encodeFunctionData({
    functionName: 'setup',
    args: [
      signers,
      1, // Threshold
      zeroAddress,
      zeroHash,
      fallbackHandler,
      zeroAddress,
      0,
      zeroAddress,
    ],
    abi: SafeL2ABI,
  });

  const predictedSafeAddress = getCreate2Address({
    from: safeFactoryContract.address as Address,
    salt: keccak256(
      encodePacked(
        ['bytes', 'uint256'],
        [keccak256(encodePacked(['bytes'], [createSafeCalldata])), saltNum as any],
      ),
    ),
    bytecode: keccak256(
      encodePacked(
        ['bytes', 'uint256'],
        [
          (await safeFactoryContract.proxyCreationCode()) as Hash,
          safeSingletonContract.address as unknown as bigint, // @dev - wtf is going on? uint256 but passing address?
        ],
      ),
    ),
  });

  const createSafeTx = buildContractCall(
    safeFactoryContract,
    'createProxyWithNonce',
    [safeSingletonContract.address, createSafeCalldata, saltNum],
    0,
    false,
  );

  return {
    predictedSafeAddress,
    createSafeTx,
  };
};
