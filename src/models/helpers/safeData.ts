import {
  getCreate2Address,
  zeroAddress,
  zeroHash,
  keccak256,
  encodePacked,
  Address,
  getContract,
  WalletClient,
  PublicClient,
  Hash,
  encodeFunctionData,
} from 'viem';
import { buildContractCall } from '../../helpers/crypto';
import { SafeMultisigDAO } from '../../types';
import { NetworkContract } from '../../types/network';

export const safeData = async (
  walletOrPublicClient: WalletClient | PublicClient,
  multiSendContract: NetworkContract,
  safeFactoryContract: NetworkContract,
  safeSingletonContract: NetworkContract,
  daoData: SafeMultisigDAO,
  saltNum: bigint,
  fallbackHandler: Address,
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
    abi: safeSingletonContract.abi,
  });

  const factoryContract = getContract({
    address: safeFactoryContract.address,
    client: walletOrPublicClient!,
    abi: safeFactoryContract.abi,
  });
  const predictedSafeAddress = getCreate2Address({
    from: safeFactoryContract.address,
    salt: keccak256(
      encodePacked(
        ['bytes', 'uint256'],
        [keccak256(encodePacked(['bytes'], [createSafeCalldata])), saltNum],
      ),
    ),
    bytecode: keccak256(
      encodePacked(
        ['bytes', 'uint256'],
        [
          (await factoryContract.read.proxyCreationCode([])) as Hash,
          safeSingletonContract.address as unknown as bigint,
        ],
      ),
    ), // @dev - wtf is going on? uint256 but passing address?
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
