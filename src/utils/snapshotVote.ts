import { Account, Address, Chain, Transport, WalletClient } from 'viem';
import {
  SnapshotVote,
  snapshotVote2Types,
  snapshotVoteArray2Types,
  snapshotVoteArrayTypes,
  SnapshotVoteForSigning,
  snapshotVoteStringTypes,
  snapshotVoteString2Types,
  snapshotVoteTypes,
  SnapshotVoteTypes,
  SnapshotSignMessage,
} from '../types/snapshot';

const NAME = 'snapshot';
const VERSION = '0.1.4';
const URL = 'https://seq.snapshot.org';

const domain = {
  name: NAME,
  version: VERSION,
} as const;

const customSerializer = (_: string, value: any) => {
  if (typeof value === 'bigint') {
    // The Snapshot API expects the timestamp to be a number,
    // even though the type is uint64 (which is a bigint).
    // So we must just do this unsafe conversion. Oh well.
    return Number(value);
  }
  return value;
};

const parseMessage = (
  from: Address,
  message: SnapshotVote,
): { message: SnapshotVoteForSigning; types: SnapshotVoteTypes } => {
  const isShutter = message?.privacy === 'shutter';
  const type2 = message.proposal.startsWith('0x');
  let types: SnapshotVoteTypes = type2 ? snapshotVote2Types : snapshotVoteTypes;

  if (['approval', 'ranked-choice'].includes(message.type)) {
    types = type2 ? snapshotVoteArray2Types : snapshotVoteArrayTypes;
  }

  let choice = message.choice;
  if (!isShutter && ['quadratic', 'weighted'].includes(message.type)) {
    types = type2 ? snapshotVoteString2Types : snapshotVoteStringTypes;
    choice = JSON.stringify(message.choice);
  }

  if (isShutter) {
    types = type2 ? snapshotVoteString2Types : snapshotVoteStringTypes;
  }

  const messageForSigning: SnapshotVoteForSigning = {
    from,
    space: message.space,
    timestamp: BigInt(Math.floor(Date.now() / 1000)),
    proposal: message.proposal,
    choice: choice,
    reason: message.reason || '',
    app: message.app || '',
    metadata: message.metadata || '{}',
  };

  return { message: messageForSigning, types };
};

const sign = async (
  walletClient: WalletClient<Transport, Chain, Account>,
  message: SnapshotVoteForSigning,
  types: SnapshotVoteTypes,
): Promise<{ address: Address; sig: string; data: any }> => {
  let signMessage: SnapshotSignMessage;

  if (types === snapshotVoteTypes || types === snapshotVote2Types) {
    signMessage = { ...message, choice: Number(message.choice) };
  } else if (types === snapshotVoteArrayTypes || types === snapshotVoteArray2Types) {
    signMessage = {
      ...message,
      choice: Array.isArray(message.choice) ? message.choice : [Number(message.choice)],
    };
  } else {
    signMessage = {
      ...message,
      choice:
        typeof message.choice === 'object'
          ? JSON.stringify(message.choice)
          : String(message.choice),
    };
  }

  const data = {
    domain,
    types,
    message: signMessage,
  };

  const sig = await walletClient.signTypedData({ ...data, primaryType: 'Vote' });

  return { address: message.from, sig, data };
};

const send = async (
  url: string,
  envelop: {
    address: Address;
    sig: string;
    data: { domain: typeof domain; types: SnapshotVoteTypes; message: SnapshotVoteForSigning };
  },
) => {
  const init = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(envelop, customSerializer),
  };

  await fetch(url, init).then(async res => {
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(JSON.stringify(errorData));
    }
  });
};

export const submitSnapshotVote = async (
  walletClient: WalletClient<Transport, Chain, Account>,
  message: SnapshotVote,
) => {
  const { message: messageForSigning, types: typesForSigning } = parseMessage(
    walletClient.account.address,
    message,
  );
  const { address, sig, data } = await sign(walletClient, messageForSigning, typesForSigning);
  await send(URL, { address, sig, data });
};
