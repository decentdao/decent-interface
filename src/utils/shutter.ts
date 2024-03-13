import { init, encrypt } from '@shutter-network/shutter-crypto';
import { BigNumber, utils } from 'ethers';

export default async function encryptWithShutter(
  choice: string,
  id: string,
): Promise<string | null> {
  const shutterPath = '/assets/scripts/shutter-crypto.wasm';
  await init(shutterPath);

  const { arrayify, hexlify, toUtf8Bytes, formatBytes32String, randomBytes } = utils;

  const bytesChoice = toUtf8Bytes(choice);
  const message = arrayify(bytesChoice);
  const eonPublicKey = arrayify(import.meta.env.VITE_APP_SHUTTER_EON_PUBKEY!);

  const is32ByteString = id.substring(0, 2) === '0x';
  const proposalId = arrayify(is32ByteString ? id : formatBytes32String(id));

  const sigma = arrayify(BigNumber.from(randomBytes(32)));

  const encryptedMessage = await encrypt(message, eonPublicKey, proposalId, sigma);

  return hexlify(encryptedMessage) ?? null;
}
