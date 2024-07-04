const SablierV2BatchAbi = [
  { inputs: [], name: 'SablierV2Batch_BatchSizeZero', type: 'error' },
  {
    inputs: [
      {
        internalType: 'contract ISablierV2LockupDynamic',
        name: 'lockupDynamic',
        type: 'address',
      },
      { internalType: 'contract IERC20', name: 'asset', type: 'address' },
      {
        components: [
          { internalType: 'address', name: 'sender', type: 'address' },
          { internalType: 'bool', name: 'cancelable', type: 'bool' },
          { internalType: 'bool', name: 'transferable', type: 'bool' },
          { internalType: 'address', name: 'recipient', type: 'address' },
          { internalType: 'uint128', name: 'totalAmount', type: 'uint128' },
          {
            components: [
              { internalType: 'address', name: 'account', type: 'address' },
              { internalType: 'UD60x18', name: 'fee', type: 'uint256' },
            ],
            internalType: 'struct Broker',
            name: 'broker',
            type: 'tuple',
          },
          {
            components: [
              { internalType: 'uint128', name: 'amount', type: 'uint128' },
              { internalType: 'UD2x18', name: 'exponent', type: 'uint64' },
              { internalType: 'uint40', name: 'delta', type: 'uint40' },
            ],
            internalType: 'struct LockupDynamic.SegmentWithDelta[]',
            name: 'segments',
            type: 'tuple[]',
          },
        ],
        internalType: 'struct Batch.CreateWithDeltas[]',
        name: 'batch',
        type: 'tuple[]',
      },
    ],
    name: 'createWithDeltas',
    outputs: [{ internalType: 'uint256[]', name: 'streamIds', type: 'uint256[]' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract ISablierV2LockupLinear',
        name: 'lockupLinear',
        type: 'address',
      },
      { internalType: 'contract IERC20', name: 'asset', type: 'address' },
      {
        components: [
          { internalType: 'address', name: 'sender', type: 'address' },
          { internalType: 'address', name: 'recipient', type: 'address' },
          { internalType: 'uint128', name: 'totalAmount', type: 'uint128' },
          { internalType: 'bool', name: 'cancelable', type: 'bool' },
          { internalType: 'bool', name: 'transferable', type: 'bool' },
          {
            components: [
              { internalType: 'uint40', name: 'cliff', type: 'uint40' },
              { internalType: 'uint40', name: 'total', type: 'uint40' },
            ],
            internalType: 'struct LockupLinear.Durations',
            name: 'durations',
            type: 'tuple',
          },
          {
            components: [
              { internalType: 'address', name: 'account', type: 'address' },
              { internalType: 'UD60x18', name: 'fee', type: 'uint256' },
            ],
            internalType: 'struct Broker',
            name: 'broker',
            type: 'tuple',
          },
        ],
        internalType: 'struct Batch.CreateWithDurations[]',
        name: 'batch',
        type: 'tuple[]',
      },
    ],
    name: 'createWithDurations',
    outputs: [{ internalType: 'uint256[]', name: 'streamIds', type: 'uint256[]' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract ISablierV2LockupDynamic',
        name: 'lockupDynamic',
        type: 'address',
      },
      { internalType: 'contract IERC20', name: 'asset', type: 'address' },
      {
        components: [
          { internalType: 'address', name: 'sender', type: 'address' },
          { internalType: 'uint40', name: 'startTime', type: 'uint40' },
          { internalType: 'bool', name: 'cancelable', type: 'bool' },
          { internalType: 'bool', name: 'transferable', type: 'bool' },
          { internalType: 'address', name: 'recipient', type: 'address' },
          { internalType: 'uint128', name: 'totalAmount', type: 'uint128' },
          {
            components: [
              { internalType: 'address', name: 'account', type: 'address' },
              { internalType: 'UD60x18', name: 'fee', type: 'uint256' },
            ],
            internalType: 'struct Broker',
            name: 'broker',
            type: 'tuple',
          },
          {
            components: [
              { internalType: 'uint128', name: 'amount', type: 'uint128' },
              { internalType: 'UD2x18', name: 'exponent', type: 'uint64' },
              { internalType: 'uint40', name: 'milestone', type: 'uint40' },
            ],
            internalType: 'struct LockupDynamic.Segment[]',
            name: 'segments',
            type: 'tuple[]',
          },
        ],
        internalType: 'struct Batch.CreateWithMilestones[]',
        name: 'batch',
        type: 'tuple[]',
      },
    ],
    name: 'createWithMilestones',
    outputs: [{ internalType: 'uint256[]', name: 'streamIds', type: 'uint256[]' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract ISablierV2LockupLinear',
        name: 'lockupLinear',
        type: 'address',
      },
      { internalType: 'contract IERC20', name: 'asset', type: 'address' },
      {
        components: [
          { internalType: 'address', name: 'sender', type: 'address' },
          { internalType: 'address', name: 'recipient', type: 'address' },
          { internalType: 'uint128', name: 'totalAmount', type: 'uint128' },
          { internalType: 'bool', name: 'cancelable', type: 'bool' },
          { internalType: 'bool', name: 'transferable', type: 'bool' },
          {
            components: [
              { internalType: 'uint40', name: 'start', type: 'uint40' },
              { internalType: 'uint40', name: 'cliff', type: 'uint40' },
              { internalType: 'uint40', name: 'end', type: 'uint40' },
            ],
            internalType: 'struct LockupLinear.Range',
            name: 'range',
            type: 'tuple',
          },
          {
            components: [
              { internalType: 'address', name: 'account', type: 'address' },
              { internalType: 'UD60x18', name: 'fee', type: 'uint256' },
            ],
            internalType: 'struct Broker',
            name: 'broker',
            type: 'tuple',
          },
        ],
        internalType: 'struct Batch.CreateWithRange[]',
        name: 'batch',
        type: 'tuple[]',
      },
    ],
    name: 'createWithRange',
    outputs: [{ internalType: 'uint256[]', name: 'streamIds', type: 'uint256[]' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export default SablierV2BatchAbi;
