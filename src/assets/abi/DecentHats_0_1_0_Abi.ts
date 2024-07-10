const DecentHats010Abi = [
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
    inputs: [
      {
        components: [
          {
            internalType: 'contract IHats',
            name: 'hatsProtocol',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'hatsAccountImplementation',
            type: 'address',
          },
          {
            internalType: 'contract IERC6551Registry',
            name: 'registry',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'keyValuePairs',
            type: 'address',
          },
          {
            internalType: 'string',
            name: 'topHatDetails',
            type: 'string',
          },
          {
            internalType: 'string',
            name: 'topHatImageURI',
            type: 'string',
          },
          {
            components: [
              {
                internalType: 'uint32',
                name: 'maxSupply',
                type: 'uint32',
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
            internalType: 'struct DecentHats_0_1_0.Hat',
            name: 'adminHat',
            type: 'tuple',
          },
          {
            components: [
              {
                internalType: 'uint32',
                name: 'maxSupply',
                type: 'uint32',
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
            internalType: 'struct DecentHats_0_1_0.Hat[]',
            name: 'hats',
            type: 'tuple[]',
          },
        ],
        internalType: 'struct DecentHats_0_1_0.CreateTreeParams',
        name: 'params',
        type: 'tuple',
      },
    ],
    name: 'createAndDeclareTree',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export default DecentHats010Abi;
