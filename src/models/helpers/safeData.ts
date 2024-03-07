import { GnosisSafeProxyFactory } from '@fractal-framework/fractal-contracts';
import { ethers } from 'ethers';
import { getCreate2Address, solidityKeccak256 } from 'ethers/lib/utils';
import { MultiSend } from '../../assets/typechain-types/usul';
import { GnosisSafeL2 } from '../../assets/typechain-types/usul/@gnosis.pm/safe-contracts/contracts';
import { buildContractCall } from '../../helpers/crypto';
import { SafeMultisigDAO } from '../../types';
const { AddressZero, HashZero } = ethers.constants;

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

  const createSafeCalldata = safeSingletonContract.interface.encodeFunctionData('setup', [
    signers,
    1, // Threshold
    AddressZero,
    HashZero,
    fallbackHandler, // Fallback handler
    AddressZero,
    0,
    AddressZero,
  ]);

  const predictedSafeAddress = getCreate2Address(
    safeFactoryContract.address,
    solidityKeccak256(
      ['bytes', 'uint256'],
      [solidityKeccak256(['bytes'], [createSafeCalldata]), saltNum],
    ),
    solidityKeccak256(
      ['bytes', 'uint256'],
      [await safeFactoryContract.proxyCreationCode(), safeSingletonContract.address],
    ),
  );

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
