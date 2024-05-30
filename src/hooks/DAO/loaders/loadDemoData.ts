import { Address, Chain } from 'viem';
import { mainnet } from 'viem/chains';
import { DAO, DAOQueryQuery } from '../../../../.graphclient';

type NetworkData = {
  [address: string]: DAO | undefined;
};

type DemoData = {
  [networkId: number]: NetworkData;
};

const decentDAOAddress = '0xB98d45F9021D71E6Fc30b43FD37FB3b1Bf12c064';
const coordinapeDAOAddress = '0xd2786bEc22F4F2500E0dd4E42cE7c9dceBB5Ff93';

const coordinapeDAO = {
  id: coordinapeDAOAddress,
  address: coordinapeDAOAddress,
  parentAddress: '',
  name: 'Coordinape DAO',
  snapshotENS: 'the-co-dao.eth',
  proposalTemplatesHash: '',
  hierarchy: [],
};

const decentDAO = {
  id: decentDAOAddress,
  address: decentDAOAddress,
  parentAddress: '',
  name: 'Decent DAO',
  snapshotENS: 'decent-dao.eth',
  proposalTemplatesHash: '',
  hierarchy: [],
};

export const demoData: DemoData = {
  [mainnet.id]: {
    [decentDAOAddress]: decentDAO,
    [coordinapeDAOAddress]: coordinapeDAO,
  },
};

export const loadDemoData = (
  chain: Chain,
  daoAddress: Address,
  result: { data?: DAOQueryQuery },
) => {
  if (demoData[chain.id] === undefined) {
    return result;
  }

  const demo = demoData[chain.id][daoAddress];

  if (demo === undefined) {
    return result;
  }

  if (result.data === undefined || result.data.daos[0] === undefined) {
    return { data: { daos: [demo] } };
  }

  const onchain = result.data.daos[0];

  return {
    data: {
      daos: [
        {
          id: daoAddress,
          address: daoAddress,
          parentAddress: onchain.parentAddress ?? demo.parentAddress,
          name: onchain.name ?? demo.name,
          snapshotENS: onchain.snapshotENS ?? demo.snapshotENS,
          proposalTemplatesHash: onchain.proposalTemplatesHash ?? demo.proposalTemplatesHash,
          hierarchy: onchain.hierarchy.length === 0 ? demo.hierarchy : onchain.hierarchy,
        },
      ],
    },
  };
};
