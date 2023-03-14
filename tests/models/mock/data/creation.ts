export const SINGLE_OWNER_MULTISIG_CREATION = {
  created: '2022-12-13T20:32:48Z',
  creator: '0x40A2aCCbd92BCA938b02010E17A5b8929b49130D',
  transactionHash: '0x932725fc8787f0694f4cda7cdf4913275d4a10792e7e93b24b84024df46e04a5',
  factoryAddress: '0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2',
  masterCopy: '0xd9Db270c1B5E3Bd161E8c8503c55cEABeE709552',
  setupData: '',
  dataDecoded: {
    method: 'setup',
    parameters: [
      {
        name: '_owners',
        type: 'address[]',
        value: ['0x2884b7Bf17Ca966bB2e4099bf384734a48885Df0'],
      },
      {
        name: '_threshold',
        type: 'uint256',
        value: '1',
      },
      {
        name: 'to',
        type: 'address',
        value: '0x0000000000000000000000000000000000000000',
      },
      {
        name: 'data',
        type: 'bytes',
        value: '0x0000000000000000000000000000000000000000000000000000000000000000',
      },
      {
        name: 'fallbackHandler',
        type: 'address',
        value: '0x0000000000000000000000000000000000000000',
      },
      {
        name: 'paymentToken',
        type: 'address',
        value: '0x0000000000000000000000000000000000000000',
      },
      {
        name: 'payment',
        type: 'uint256',
        value: '0',
      },
      {
        name: 'paymentReceiver',
        type: 'address',
        value: '0x0000000000000000000000000000000000000000',
      },
    ],
  },
};

export const createSafeInfo = (safeAddress: string, owners: string[]) => {
  return {
    address: safeAddress,
    nonce: 7,
    threshold: 1,
    owners: owners,
    masterCopy: '0xd9Db270c1B5E3Bd161E8c8503c55cEABeE709552',
    modules: ['0x4Ff13453B22507Ce0bec862f2b26b33EdEB7DBe8'],
    fallbackHandler: '0x0000000000000000000000000000000000000000',
    guard: '0x0000000000000000000000000000000000000000',
    version: '1.3.0',
  };
};

export const EMPTY_TRANSACTIONS = {
  count: 0,
  results: [],
};
