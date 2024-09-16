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
              {
                components: [
                  {
                    internalType: 'contract ISablierV2LockupLinear',
                    name: 'sablier',
                    type: 'address',
                  },
                  {
                    internalType: 'address',
                    name: 'sender',
                    type: 'address',
                  },
                  {
                    internalType: 'uint128',
                    name: 'totalAmount',
                    type: 'uint128',
                  },
                  {
                    internalType: 'address',
                    name: 'asset',
                    type: 'address',
                  },
                  {
                    internalType: 'bool',
                    name: 'cancelable',
                    type: 'bool',
                  },
                  {
                    internalType: 'bool',
                    name: 'transferable',
                    type: 'bool',
                  },
                  {
                    components: [
                      {
                        internalType: 'uint40',
                        name: 'start',
                        type: 'uint40',
                      },
                      {
                        internalType: 'uint40',
                        name: 'cliff',
                        type: 'uint40',
                      },
                      {
                        internalType: 'uint40',
                        name: 'end',
                        type: 'uint40',
                      },
                    ],
                    internalType: 'struct LockupLinear.Timestamps',
                    name: 'timestamps',
                    type: 'tuple',
                  },
                  {
                    components: [
                      {
                        internalType: 'address',
                        name: 'account',
                        type: 'address',
                      },
                      {
                        internalType: 'uint256',
                        name: 'fee',
                        type: 'uint256',
                      },
                    ],
                    internalType: 'struct LockupLinear.Broker',
                    name: 'broker',
                    type: 'tuple',
                  },
                ],
                internalType: 'struct DecentHats_0_1_0.SablierStreamParams[]',
                name: 'sablierParams',
                type: 'tuple[]',
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
              {
                components: [
                  {
                    internalType: 'contract ISablierV2LockupLinear',
                    name: 'sablier',
                    type: 'address',
                  },
                  {
                    internalType: 'address',
                    name: 'sender',
                    type: 'address',
                  },
                  {
                    internalType: 'uint128',
                    name: 'totalAmount',
                    type: 'uint128',
                  },
                  {
                    internalType: 'address',
                    name: 'asset',
                    type: 'address',
                  },
                  {
                    internalType: 'bool',
                    name: 'cancelable',
                    type: 'bool',
                  },
                  {
                    internalType: 'bool',
                    name: 'transferable',
                    type: 'bool',
                  },
                  {
                    components: [
                      {
                        internalType: 'uint40',
                        name: 'start',
                        type: 'uint40',
                      },
                      {
                        internalType: 'uint40',
                        name: 'cliff',
                        type: 'uint40',
                      },
                      {
                        internalType: 'uint40',
                        name: 'end',
                        type: 'uint40',
                      },
                    ],
                    internalType: 'struct LockupLinear.Timestamps',
                    name: 'timestamps',
                    type: 'tuple',
                  },
                  {
                    components: [
                      {
                        internalType: 'address',
                        name: 'account',
                        type: 'address',
                      },
                      {
                        internalType: 'uint256',
                        name: 'fee',
                        type: 'uint256',
                      },
                    ],
                    internalType: 'struct LockupLinear.Broker',
                    name: 'broker',
                    type: 'tuple',
                  },
                ],
                internalType: 'struct DecentHats_0_1_0.SablierStreamParams[]',
                name: 'sablierParams',
                type: 'tuple[]',
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
