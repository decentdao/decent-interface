import { GnosisSafeProxyFactory } from '@fractal-framework/fractal-contracts';
import {
  getCreate2Address,
  zeroAddress,
  zeroHash,
  keccak256,
  encodePacked,
  getAddress,
  encodeFunctionData,
  isHex,
  hexToBigInt,
} from 'viem';
import GnosisSafeL2ABI from '../../assets/abi/GnosisSafeL2';
import { MultiSend } from '../../assets/typechain-types/usul';
import { GnosisSafeL2 } from '../../assets/typechain-types/usul/@gnosis.pm/safe-contracts/contracts';
import { buildContractCall } from '../../helpers/crypto';
import { SafeMultisigDAO } from '../../types';

export const safeData = async (
  multiSendContract: MultiSend,
  safeFactoryContract: GnosisSafeProxyFactory,
  safeSingletonContract: GnosisSafeL2,
  daoData: SafeMultisigDAO,
  saltNum: bigint,
  fallbackHandler: string,
  hasAzorius?: boolean,
) => {
  const signers = hasAzorius
    ? [multiSendContract.address]
    : [...daoData.trustedAddresses, multiSendContract.address];

  const createSafeCalldata = encodeFunctionData({
    functionName: 'setup',
    args: [
      signers.map(signer => getAddress(signer)),
      1n, // Threshold
      zeroAddress,
      zeroHash,
      getAddress(fallbackHandler),
      zeroAddress,
      0n,
      zeroAddress,
    ],
    abi: GnosisSafeL2ABI,
  });

  const safeFactoryContractProxyCreationCode = await safeFactoryContract.proxyCreationCode();
  if (!isHex(safeFactoryContractProxyCreationCode)) {
    throw new Error('Error retrieving proxy creation code from Safe Factory Contract ');
  }

  const predictedSafeAddress = getCreate2Address({
    from: getAddress(safeFactoryContract.address),
    salt: keccak256(
      encodePacked(
        ['bytes', 'uint256'],
        [keccak256(encodePacked(['bytes'], [createSafeCalldata])), saltNum],
      ),
    ),
    bytecodeHash: keccak256(
      encodePacked(
        ['bytes', 'uint256'],
        [
          safeFactoryContractProxyCreationCode,
          hexToBigInt(getAddress(safeSingletonContract.address)),
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
