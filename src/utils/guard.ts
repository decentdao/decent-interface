import { SafeMultisigTransactionWithTransfersResponse } from '@safe-global/safe-service-client';
import { PublicClient, keccak256, encodePacked, Address, Hex } from 'viem';
import { buildSignatureBytes } from '../helpers/crypto';
import { Activity, MultisigFreezeGuard } from '../types';
import { getTimeStamp } from './contract';

export async function getTxTimelockedTimestamp(
  activity: Activity,
  freezeGuard: MultisigFreezeGuard,
  publicClient: PublicClient,
) {
  const multiSigTransaction = activity.transaction as SafeMultisigTransactionWithTransfersResponse;

  const signatures = buildSignatureBytes(
    multiSigTransaction.confirmations!.map(confirmation => ({
      signer: confirmation.owner as Address,
      data: confirmation.signature as Hex,
    })),
  );
  const signaturesHash = keccak256(encodePacked(['bytes'], [signatures]));

  const timelockedTimestamp = await getTimeStamp(
    (await freezeGuard.read.getTransactionTimelockedBlock([signaturesHash])) as bigint,
    publicClient,
  );
  return timelockedTimestamp;
}
