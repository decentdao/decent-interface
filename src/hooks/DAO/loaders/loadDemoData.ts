import { Address, Chain } from 'viem';
import { mainnet } from 'viem/chains';
import { DAO, DAOQueryQuery } from '../../../../.graphclient';

type NetworkData = {
  [address: string]: DAO;
};

type DemoData = {
  [networkId: number]: NetworkData;
};

const decentDAO = '0xB98d45F9021D71E6Fc30b43FD37FB3b1Bf12c064';
const coordinapeDAO = '0xd2786bEc22F4F2500E0dd4E42cE7c9dceBB5Ff93';

export const demoData: DemoData = {
  [mainnet.id]: {
    [decentDAO]: {
      id: decentDAO,
      address: decentDAO,
      parentAddress: '',
      name: 'Decent DAO',
      snapshotENS: 'decent-dao.eth',
      proposalTemplatesHash: '',
      hierarchy: [],
    },
    [coordinapeDAO]: {
      id: coordinapeDAO,
      address: coordinapeDAO,
      parentAddress: '',
      name: 'Coordinape DAO',
      snapshotENS: 'the-co-dao.eth',
      proposalTemplatesHash: '',
      hierarchy: [],
    },
  },
};

export const loadDemoData = (
  chain: Chain,
  daoAddress: Address,
  queryData: DAOQueryQuery | undefined,
): DAOQueryQuery | undefined => {
  let demo: DAO | undefined;
  let data: DAOQueryQuery = { daos: [] };
  switch (chain) {
    case mainnet: {
      demo = demoData[chain.id][daoAddress];
      if (queryData && queryData.daos[0]) {
        demo = { ...demo, ...queryData.daos[0] };
      }
      break;
    }
    default: {
      break;
    }
  }

  if (demo) {
    data.daos = [demo];
  }

  return data;
};
