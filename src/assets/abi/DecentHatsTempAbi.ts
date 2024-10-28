export const DecentHatsTempAbi = [
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
            name: 'registry',
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
            name: 'decentAutonomousAdminMasterCopy',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'hatsAccountImplementation',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'keyValuePairs',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'hatsElectionEligibilityImplementation',
            type: 'address',
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
                internalType: 'struct DecentHats.SablierStreamParams[]',
                name: 'sablierParams',
                type: 'tuple[]',
              },
              {
                components: [
                  {
                    internalType: 'uint128',
                    name: 'termEndDateTs',
                    type: 'uint128',
                  },
                  {
                    internalType: 'address[]',
                    name: 'nominatedWearers',
                    type: 'address[]',
                  },
                ],
                internalType: 'struct DecentHats.TermedParams[]',
                name: 'termedParams',
                type: 'tuple[]',
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
              {
                internalType: 'bool',
                name: 'isTermed',
                type: 'bool',
              },
            ],
            internalType: 'struct DecentHats.Hat',
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
                internalType: 'struct DecentHats.SablierStreamParams[]',
                name: 'sablierParams',
                type: 'tuple[]',
              },
              {
                components: [
                  {
                    internalType: 'uint128',
                    name: 'termEndDateTs',
                    type: 'uint128',
                  },
                  {
                    internalType: 'address[]',
                    name: 'nominatedWearers',
                    type: 'address[]',
                  },
                ],
                internalType: 'struct DecentHats.TermedParams[]',
                name: 'termedParams',
                type: 'tuple[]',
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
              {
                internalType: 'bool',
                name: 'isTermed',
                type: 'bool',
              },
            ],
            internalType: 'struct DecentHats.Hat[]',
            name: 'hats',
            type: 'tuple[]',
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
        ],
        internalType: 'struct DecentHats.CreateTreeParams',
        name: 'params',
        type: 'tuple',
      },
    ],
    name: 'createAndDeclareTree',
    outputs: [],
    stateMutability: 'nonpayable',
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
            name: 'registry',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'topHatAccount',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'hatsAccountImplementation',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'adminHatId',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'topHatId',
            type: 'uint256',
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
                internalType: 'struct DecentHats.SablierStreamParams[]',
                name: 'sablierParams',
                type: 'tuple[]',
              },
              {
                components: [
                  {
                    internalType: 'uint128',
                    name: 'termEndDateTs',
                    type: 'uint128',
                  },
                  {
                    internalType: 'address[]',
                    name: 'nominatedWearers',
                    type: 'address[]',
                  },
                ],
                internalType: 'struct DecentHats.TermedParams[]',
                name: 'termedParams',
                type: 'tuple[]',
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
              {
                internalType: 'bool',
                name: 'isTermed',
                type: 'bool',
              },
            ],
            internalType: 'struct DecentHats.Hat',
            name: 'hat',
            type: 'tuple',
          },
        ],
        internalType: 'struct DecentHats.CreateRoleHatParams',
        name: 'params',
        type: 'tuple',
      },
    ],
    name: 'createRoleHat',
    outputs: [],
    stateMutability: 'nonpayable',
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
            name: 'registry',
            type: 'address',
          },
          {
            internalType: 'contract IHatsModuleFactory',
            name: 'hatsModuleFactory',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'topHatAccount',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'hatsAccountImplementation',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'hatsElectionEligibilityImplementation',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'adminHatId',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'topHatId',
            type: 'uint256',
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
                internalType: 'struct DecentHats.SablierStreamParams[]',
                name: 'sablierParams',
                type: 'tuple[]',
              },
              {
                components: [
                  {
                    internalType: 'uint128',
                    name: 'termEndDateTs',
                    type: 'uint128',
                  },
                  {
                    internalType: 'address[]',
                    name: 'nominatedWearers',
                    type: 'address[]',
                  },
                ],
                internalType: 'struct DecentHats.TermedParams[]',
                name: 'termedParams',
                type: 'tuple[]',
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
              {
                internalType: 'bool',
                name: 'isTermed',
                type: 'bool',
              },
            ],
            internalType: 'struct DecentHats.Hat',
            name: 'hat',
            type: 'tuple',
          },
        ],
        internalType: 'struct DecentHats.CreateTermedRoleHatParams',
        name: 'params',
        type: 'tuple',
      },
    ],
    name: 'createTermedRoleHat',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;
