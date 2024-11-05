import { getAddress, isAddress } from 'viem';
import { DAO } from '../../.graphclient';
import { Node } from '../types';

export const mapChildNodes = (dao: DAO) => {
  return dao.hierarchy.map((node: DAO): Node => {
    if (!isAddress(node.parentAddress)) {
      return {
        nodeHierarchy: {
          parentAddress: null,
          childNodes: [],
        },
        daoName: null,
        address: node.address,
      };
    }

    return {
      nodeHierarchy: {
        parentAddress: getAddress(node.parentAddress),
        childNodes: mapChildNodes(node),
      },
      daoName: node.name === null || node.name === undefined ? null : node.name,
      address: node.address,
    };
  });
};
