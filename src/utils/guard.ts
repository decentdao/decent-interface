import { MultisigFreezeGuard } from '@fractal-framework/fractal-contracts';
import { SafeMultisigTransactionWithTransfersResponse } from '@safe-global/safe-service-client';
import { ethers } from 'ethers';
import { buildSignatureBytes } from '../helpers/crypto';
import { Activity } from '../types';
import { Providers } from '../types/network';
import { getTimeStamp } from './contract';

export async function getTxTimelockedTimestamp(
  activity: Activity,
  freezeGuard: MultisigFreezeGuard,
  provider: Providers,
) {
  const multiSigTransaction = activity.transaction as SafeMultisigTransactionWithTransfersResponse;

  const signatures = buildSignatureBytes(
    multiSigTransaction.confirmations!.map(confirmation => ({
      signer: confirmation.owner,
      data: confirmation.signature,
    })),
  );
  const signaturesHash = ethers.utils.solidityKeccak256(['bytes'], [signatures]);

  const timelockedTimestamp = await getTimeStamp(
    await freezeGuard.getTransactionTimelockedBlock(signaturesHash),
    provider,
  );
  return timelockedTimestamp;
}
