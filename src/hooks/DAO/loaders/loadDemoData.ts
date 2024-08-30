import { Address, Chain } from 'viem';
import { mainnet } from 'viem/chains';
import { DAO, DAOQueryQuery } from '../../../../.graphclient';

type NetworkData = {
  [address: string]: DAO | undefined;
};

type DemoData = {
  [networkId: number]: NetworkData;
};

const theCoDAOAddress = '0xd2786bEc22F4F2500E0dd4E42cE7c9dceBB5Ff93';
const coordinapeDAOAddress = '0x15B513F658f7390D8720dCE321f50974B28672EF';

const coordinapeDAO = {
  id: coordinapeDAOAddress,
  address: coordinapeDAOAddress,
  parentAddress: theCoDAOAddress,
  name: 'Coordinape DAO',
  snapshotENS: 'coordinape.eth',
  proposalTemplatesHash: '',
  hierarchy: [],
};

const theCoDAO = {
  id: theCoDAOAddress,
  address: theCoDAOAddress,
  parentAddress: '',
  name: 'The CO DAO',
  snapshotENS: 'the-co-dao.eth',
  proposalTemplatesHash: '',
  hierarchy: [coordinapeDAO],
};

export const demoData: DemoData = {
  [mainnet.id]: {
    [theCoDAOAddress]: theCoDAO,
    [coordinapeDAOAddress]: coordinapeDAO,
  },
};

export const loadDemoData = (
  chain: Chain,
  safeAddress: Address,
  result: { data?: DAOQueryQuery },
) => {
  if (demoData[chain.id] === undefined) {
    return result;
  }

  const demo = demoData[chain.id][safeAddress];

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
          id: safeAddress,
          address: safeAddress,
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
