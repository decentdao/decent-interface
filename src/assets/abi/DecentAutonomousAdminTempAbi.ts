export default [
  {
    inputs: [],
    name: 'NAME',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'setUp',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'currentWearer',
            type: 'address',
          },
          {
            internalType: 'contract IHats',
            name: 'userHatProtocol',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'userHatId',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'nominatedWearer',
            type: 'address',
          },
          {
            components: [
              {
                internalType: 'uint256',
                name: 'streamId',
                type: 'uint256',
              },
              {
                internalType: 'contract ISablierV2LockupLinear',
                name: 'sablierV2LockupLinear',
                type: 'address',
              },
            ],
            internalType: 'struct DecentAutonomousAdmin.SablierStreamInfo[]',
            name: 'sablierStreamInfo',
            type: 'tuple[]',
          },
        ],
        internalType: 'struct DecentAutonomousAdmin.TriggerStartArgs',
        name: 'args',
        type: 'tuple',
      },
    ],
    name: 'triggerStartNextTerm',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'version_',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;
