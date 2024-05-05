import { DAO } from '../../.graphclient';
import { Node } from '../types';

type DAOQueryNode = Pick<
  DAO,
  | 'id'
  | 'address'
  | 'parentAddress'
  | 'name'
  | 'snapshotENS'
  | 'proposalTemplatesHash'
  | 'hierarchy'
>;

export const mapChildNodes = (dao: DAOQueryNode) => {
  return dao.hierarchy.map((node: DAO): Node => {
    return {
      nodeHierarchy: {
        parentAddress: node.parentAddress,
        childNodes: mapChildNodes(node),
      },
      daoName: node.name === null || node.name === undefined ? null : node.name,
      daoAddress: node.address,
    };
  });
};
