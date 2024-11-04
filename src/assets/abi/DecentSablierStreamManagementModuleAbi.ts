export default [
  {
    inputs: [
      {
        internalType: 'contract ISablierV2Lockup',
        name: 'sablier',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'streamId',
        type: 'uint256',
      },
    ],
    name: 'cancelStream',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract ISablierV2Lockup',
        name: 'sablier',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'recipientHatAccount',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'streamId',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
    ],
    name: 'withdrawMaxFromStream',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;
