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
  GetContractReturnType,
  PublicClient,
} from 'viem';
import GnosisSafeL2Abi from '../../assets/abi/GnosisSafeL2';
import GnosisSafeProxyFactoryAbi from '../../assets/abi/GnosisSafeProxyFactory';
import { MultiSend } from '../../assets/typechain-types/usul';
import { GnosisSafeL2 } from '../../assets/typechain-types/usul/@gnosis.pm/safe-contracts/contracts';
import { buildContractCallViem } from '../../helpers/crypto';
import { SafeMultisigDAO } from '../../types';

export const safeData = async (
  multiSendContract: MultiSend,
  safeFactoryContract: GetContractReturnType<typeof GnosisSafeProxyFactoryAbi, PublicClient>,
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
    abi: GnosisSafeL2Abi,
  });

  const safeFactoryContractProxyCreationCode = await safeFactoryContract.read.proxyCreationCode();
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

  const createSafeTx = buildContractCallViem(
    GnosisSafeProxyFactoryAbi,
    safeFactoryContract.address,
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
