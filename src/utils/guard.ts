import { MultisigFreezeGuard } from '@fractal-framework/fractal-contracts';
import { SafeMultisigTransactionWithTransfersResponse } from '@safe-global/safe-service-client';
import { ethers } from 'ethers';
import { Activity } from '../types';
import { Providers } from '../types/network';
import { getTimeStamp } from './contract';

export async function getTxTimelockedTimestamp(
  activity: Activity,
  freezeGuard: MultisigFreezeGuard,
  provider: Providers
) {
  const multiSigTransaction = activity.transaction as SafeMultisigTransactionWithTransfersResponse;

  const abiCoder = new ethers.utils.AbiCoder();
  const freezeGuardTransactionHash = ethers.utils.solidityKeccak256(
    ['bytes'],
    [
      abiCoder.encode(
        [
          'address',
          'uint256',
          'bytes32',
          'uint256',
          'uint256',
          'uint256',
          'uint256',
          'address',
          'address',
        ],
        [
          multiSigTransaction.to,
          multiSigTransaction.value,
          ethers.utils.solidityKeccak256(['bytes'], [multiSigTransaction.data || '0x']),
          multiSigTransaction.operation,
          multiSigTransaction.safeTxGas,
          multiSigTransaction.baseGas,
          multiSigTransaction.gasPrice,
          multiSigTransaction.gasToken,
          multiSigTransaction.refundReceiver as string,
        ]
      ),
    ]
  );

  const timelockedTimestamp = await getTimeStamp(
    await freezeGuard.getTransactionTimelockedBlock(freezeGuardTransactionHash),
    provider
  );

  return timelockedTimestamp;
}
