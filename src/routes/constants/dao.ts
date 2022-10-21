export const DAO_ROUTES = {
  daoHome: (daoAddress: string) => `/daos/${daoAddress}`,
  activties: (daoAddress: string) => `/daos/${daoAddress}/activities`,
  treasury: (daoAddress: string) => `/daos/${daoAddress}/treasury`,
  proposals: (daoAddress: string) => `/daos/${daoAddress}/proposals`,
  proposal: (daoAddress: string, proposalId: string) =>
    `/daos/${daoAddress}/proposals/${proposalId}`,
  proposalNew: (daoAddress: string) => `/daos/${daoAddress}/proposals/new`,
};
