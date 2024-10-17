import { Account, Address, Chain, Transport, WalletClient } from 'viem';

const NAME = 'snapshot';
const VERSION = '0.1.4';
const URL = 'https://seq.snapshot.org';

const domain = {
  name: NAME,
  version: VERSION,
} as const;

type ProposalType =
  | 'single-choice'
  | 'approval'
  | 'quadratic'
  | 'ranked-choice'
  | 'weighted'
  | 'basic';

const voteTypes = {
  Vote: [
    { name: 'from', type: 'address' },
    { name: 'space', type: 'string' },
    { name: 'timestamp', type: 'uint64' },
    { name: 'proposal', type: 'string' },
    { name: 'choice', type: 'uint32' },
    { name: 'reason', type: 'string' },
    { name: 'app', type: 'string' },
    { name: 'metadata', type: 'string' },
  ],
} as const;

const vote2Types = {
  Vote: [
    { name: 'from', type: 'address' },
    { name: 'space', type: 'string' },
    { name: 'timestamp', type: 'uint64' },
    { name: 'proposal', type: 'bytes32' },
    { name: 'choice', type: 'uint32' },
    { name: 'reason', type: 'string' },
    { name: 'app', type: 'string' },
    { name: 'metadata', type: 'string' },
  ],
} as const;

const voteArray2Types = {
  Vote: [
    { name: 'from', type: 'address' },
    { name: 'space', type: 'string' },
    { name: 'timestamp', type: 'uint64' },
    { name: 'proposal', type: 'bytes32' },
    { name: 'choice', type: 'uint32[]' },
    { name: 'reason', type: 'string' },
    { name: 'app', type: 'string' },
    { name: 'metadata', type: 'string' },
  ],
} as const;

const voteArrayTypes = {
  Vote: [
    { name: 'from', type: 'address' },
    { name: 'space', type: 'string' },
    { name: 'timestamp', type: 'uint64' },
    { name: 'proposal', type: 'string' },
    { name: 'choice', type: 'uint32[]' },
    { name: 'reason', type: 'string' },
    { name: 'app', type: 'string' },
    { name: 'metadata', type: 'string' },
  ],
} as const;

const voteString2Types = {
  Vote: [
    { name: 'from', type: 'address' },
    { name: 'space', type: 'string' },
    { name: 'timestamp', type: 'uint64' },
    { name: 'proposal', type: 'bytes32' },
    { name: 'choice', type: 'string' },
    { name: 'reason', type: 'string' },
    { name: 'app', type: 'string' },
    { name: 'metadata', type: 'string' },
  ],
} as const;

const voteStringTypes = {
  Vote: [
    { name: 'from', type: 'address' },
    { name: 'space', type: 'string' },
    { name: 'timestamp', type: 'uint64' },
    { name: 'proposal', type: 'string' },
    { name: 'choice', type: 'string' },
    { name: 'reason', type: 'string' },
    { name: 'app', type: 'string' },
    { name: 'metadata', type: 'string' },
  ],
} as const;

// Now, let's create a union type for all possible vote types
type VoteTypes =
  | typeof voteTypes
  | typeof vote2Types
  | typeof voteArrayTypes
  | typeof voteArray2Types
  | typeof voteStringTypes
  | typeof voteString2Types;

interface Vote {
  from: Address;
  space: string;
  proposal: string;
  type: ProposalType;
  choice:
    | number
    | number[]
    | string
    | {
        [key: string]: number;
      };
  privacy?: string;
  reason?: string;
  app?: string;
  metadata?: string;
}

interface VoteForSigning extends Omit<Vote, 'type' | 'privacy'> {
  timestamp: bigint;
  reason: string;
  app: string;
  metadata: string;
}

// Add these type definitions at the top of the file or in a separate types file
type SignMessageBase = Omit<VoteForSigning, 'choice'>;

type SignMessageSingleChoice = SignMessageBase & {
  choice: number;
};

type SignMessageArrayChoice = SignMessageBase & {
  choice: number[];
};

type SignMessageStringChoice = SignMessageBase & {
  choice: string;
};

type SignMessage = SignMessageSingleChoice | SignMessageArrayChoice | SignMessageStringChoice;

const parseMessage = (message: Vote): { message: VoteForSigning; types: VoteTypes } => {
  const isShutter = message?.privacy === 'shutter';
  const type2 = message.proposal.startsWith('0x');
  let types: VoteTypes = type2 ? vote2Types : voteTypes;

  if (['approval', 'ranked-choice'].includes(message.type)) {
    types = type2 ? voteArray2Types : voteArrayTypes;
  }

  let choice = message.choice;
  if (!isShutter && ['quadratic', 'weighted'].includes(message.type)) {
    types = type2 ? voteString2Types : voteStringTypes;
    choice = JSON.stringify(message.choice);
  }

  if (isShutter) {
    types = type2 ? voteString2Types : voteStringTypes;
  }

  const messageForSigning: VoteForSigning = {
    from: message.from || '',
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
  message: VoteForSigning,
  types: VoteTypes,
): Promise<{ address: Address; sig: string; data: any }> => {
  let signMessage: SignMessage;

  if (types === voteTypes || types === vote2Types) {
    signMessage = { ...message, choice: Number(message.choice) };
  } else if (types === voteArrayTypes || types === voteArray2Types) {
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
    primaryType: 'Vote' as const,
  };

  const sig = await walletClient.signTypedData(data);

  return { address: message.from, sig, data };
};

const send = async (
  url: string,
  envelop: {
    address: Address;
    sig: string;
    data: { domain: typeof domain; types: VoteTypes; message: VoteForSigning };
  },
) => {
  let address = url;
  const init = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(envelop),
  };

  await fetch(address, init).then(async res => {
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(JSON.stringify(errorData));
    }
  });
};

export const submitSnapshotVote = async (
  walletClient: WalletClient<Transport, Chain, Account>,
  message: Vote,
) => {
  const { message: messageForSigning, types: typesForSigning } = parseMessage(message);
  const { address, sig, data } = await sign(walletClient, messageForSigning, typesForSigning);
  await send(URL, { address, sig, data });
};
