export const mapChildNodes = (_hierarchy: any) => {
  return _hierarchy.map((node: any) => {
    return {
      nodeHierarchy: {
        parentAddress: node.parentAddress,
        childNodes: mapChildNodes(node.hierarchy),
      },
      daoName: node.name,
      daoAddress: node.address,
    };
  });
};
