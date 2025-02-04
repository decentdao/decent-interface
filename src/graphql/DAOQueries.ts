export const DAOQuery = `query DAOQuery($safeAddress: Bytes) {
  daos(where: { id: $safeAddress }) {
    id
    address
    parentAddress
    name
    snapshotENS
    hierarchy {
      id
      address
      parentAddress
      name
      snapshotENS
      # There's probably a better way to organize this with Fragments
      # However, current GraphQL spec does not allow recursive fragment.
      # Though this might be improved via generating GraphQL typings from fractal-subgraph repository
      # Gonna keep it this "dumb" way for PoC purpose only
      hierarchy {
        id
        address
        parentAddress
        name
        snapshotENS
        hierarchy {
          id
          address
          parentAddress
          name
          snapshotENS
          hierarchy {
            id
            address
            parentAddress
            name
            snapshotENS
          }
        }
      }
    }
    proposalTemplatesHash
  }
}`;
