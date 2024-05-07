const FractalRegistryAbi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'daoAddress',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'daoName',
        type: 'string',
      },
    ],
    name: 'FractalNameUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'parentDAOAddress',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'subDAOAddress',
        type: 'address',
      },
    ],
    name: 'FractalSubDAODeclared',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_subDAOAddress',
        type: 'address',
      },
    ],
    name: 'declareSubDAO',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: '_name',
        type: 'string',
      },
    ],
    name: 'updateDAOName',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export default FractalRegistryAbi;
