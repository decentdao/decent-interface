export const DecentHatsTempAbi = [
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
        components: [
          {
            internalType: 'contract IHats',
            name: 'hatsProtocol',
            type: 'address',
          },
          {
            internalType: 'contract IERC6551Registry',
            name: 'erc6551Registry',
            type: 'address',
          },
          {
            internalType: 'contract IHatsModuleFactory',
            name: 'hatsModuleFactory',
            type: 'address',
          },
          {
            internalType: 'contract ModuleProxyFactory',
            name: 'moduleProxyFactory',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'keyValuePairs',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'decentAutonomousAdminImplementation',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'hatsAccountImplementation',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'hatsElectionsEligibilityImplementation',
            type: 'address',
          },
          {
            components: [
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
            ],
            internalType: 'struct DecentHatsCreationModule.TopHatParams',
            name: 'topHat',
            type: 'tuple',
          },
          {
            components: [
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
            ],
            internalType: 'struct DecentHatsCreationModule.AdminHatParams',
            name: 'adminHat',
            type: 'tuple',
          },
          {
            components: [
              {
                internalType: 'address',
                name: 'wearer',
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
                    internalType: 'address',
                    name: 'asset',
                    type: 'address',
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
                        internalType: 'UD60x18',
                        name: 'fee',
                        type: 'uint256',
                      },
                    ],
                    internalType: 'struct Broker',
                    name: 'broker',
                    type: 'tuple',
                  },
                  {
                    internalType: 'uint128',
                    name: 'totalAmount',
                    type: 'uint128',
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
                ],
                internalType: 'struct DecentHatsModuleUtils.SablierStreamParams[]',
                name: 'sablierStreamsParams',
                type: 'tuple[]',
              },
              {
                internalType: 'uint128',
                name: 'termEndDateTs',
                type: 'uint128',
              },
              {
                internalType: 'uint32',
                name: 'maxSupply',
                type: 'uint32',
              },
              {
                internalType: 'bool',
                name: 'isMutable',
                type: 'bool',
              },
            ],
            internalType: 'struct DecentHatsModuleUtils.HatParams[]',
            name: 'hats',
            type: 'tuple[]',
          },
        ],
        internalType: 'struct DecentHatsCreationModule.CreateTreeParams',
        name: 'treeParams',
        type: 'tuple',
      },
    ],
    name: 'createAndDeclareTree',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;
