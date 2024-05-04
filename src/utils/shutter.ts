import { init, encrypt } from '@shutter-network/shutter-crypto';
import { toBytes, toHex, stringToBytes, stringToHex, bytesToHex } from 'viem';

export default async function encryptWithShutter(
  choice: string,
  id: string,
): Promise<string | null> {
  const shutterPath = '/assets/scripts/shutter-crypto.wasm';
  await init(shutterPath);

  const bytesChoice = stringToBytes(choice);
  const message = toHex(bytesChoice);
  const eonPublicKey = toBytes(import.meta.env.VITE_APP_SHUTTER_EON_PUBKEY!);

  const is32ByteString = id.substring(0, 2) === '0x';
  const proposalId = toBytes(is32ByteString ? id : stringToHex(id, { size: 32 }));

  const randomBytes = crypto.getRandomValues(new Uint8Array(32));
  const sigma = bytesToHex(randomBytes);

  const encryptedMessage = await encrypt(message, eonPublicKey, proposalId, sigma);

  return toHex(encryptedMessage) ?? null;
}
