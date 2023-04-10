import { VetoGuard } from '@fractal-framework/fractal-contracts';
import { SafeMultisigTransactionWithTransfersResponse } from '@safe-global/safe-service-client';
import { ethers } from 'ethers';
import { Activity } from '../types';

export async function getTxQueuedTimestamp(activity: Activity, vetoGuard: VetoGuard) {
  const multiSigTransaction = activity.transaction as SafeMultisigTransactionWithTransfersResponse;

  const abiCoder = new ethers.utils.AbiCoder();
  const vetoGuardTransactionHash = ethers.utils.solidityKeccak256(
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

  const queuedTimestamp = (
    await vetoGuard.getTransactionQueuedTimestamp(vetoGuardTransactionHash)
  ).toNumber();

  return queuedTimestamp;
}
