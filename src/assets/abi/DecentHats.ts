const DecentHatsAbi = [
  {
    inputs: [
      {
        internalType: 'contract IHats',
        name: '_hats',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_keyValuePairs',
        type: 'address',
      },
      {
        internalType: 'contract IERC6551Registry',
        name: '_registry',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_hatsAccountImplementation',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [],
    name: 'SALT',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: '_topHatDetails',
        type: 'string',
      },
      {
        internalType: 'string',
        name: '_topHatImageURI',
        type: 'string',
      },
      {
        components: [
          {
            internalType: 'address',
            name: 'eligibility',
            type: 'address',
          },
          {
            internalType: 'uint32',
            name: 'maxSupply',
            type: 'uint32',
          },
          {
            internalType: 'address',
            name: 'toggle',
            type: 'address',
          },
          {
            internalType: 'string',
            name: 'details',
            type: 'string',
          },
          {
            internalType: 'string',
            name: 'imageURI',
            type: 'string',
          },
          {
            internalType: 'bool',
            name: 'isMutable',
            type: 'bool',
          },
          {
            internalType: 'address',
            name: 'wearer',
            type: 'address',
          },
        ],
        internalType: 'struct DecentHats.Hat',
        name: '_adminHat',
        type: 'tuple',
      },
      {
        components: [
          {
            internalType: 'address',
            name: 'eligibility',
            type: 'address',
          },
          {
            internalType: 'uint32',
            name: 'maxSupply',
            type: 'uint32',
          },
          {
            internalType: 'address',
            name: 'toggle',
            type: 'address',
          },
          {
            internalType: 'string',
            name: 'details',
            type: 'string',
          },
          {
            internalType: 'string',
            name: 'imageURI',
            type: 'string',
          },
          {
            internalType: 'bool',
            name: 'isMutable',
            type: 'bool',
          },
          {
            internalType: 'address',
            name: 'wearer',
            type: 'address',
          },
        ],
        internalType: 'struct DecentHats.Hat[]',
        name: '_hats',
        type: 'tuple[]',
      },
    ],
    name: 'createAndDeclareTree',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'hats',
    outputs: [
      {
        internalType: 'contract IHats',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'hatsAccountImplementation',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'keyValuePairs',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'registry',
    outputs: [
      {
        internalType: 'contract IERC6551Registry',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export default DecentHatsAbi;
