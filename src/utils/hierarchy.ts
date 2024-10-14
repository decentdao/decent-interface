import { DAO } from '../../.graphclient';
import { Node } from '../types';

export const mapChildNodes = (dao: DAO) => {
  return dao.hierarchy.map((node: DAO): Node => {
    return {
      nodeHierarchy: {
        parentAddress: node.parentAddress,
        childNodes: mapChildNodes(node),
      },
      daoName: node.name === null || node.name === undefined ? null : node.name,
      address: node.address,
    };
  });
};
