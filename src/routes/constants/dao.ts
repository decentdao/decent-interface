export const DAO_ROUTES = {
  dao: {
    relative: (daoAddress: string) => `/daos/${daoAddress}`,
    path: 'daos/*',
  },
  new: {
    relative: (daoAddress: string) => `/daos/${daoAddress}`,
    path: 'new',
  },
  activties: {
    relative: (daoAddress: string) => `/daos/${daoAddress}/activities`,
    path: 'activities',
  },
  treasury: {
    relative: (daoAddress: string) => `/daos/${daoAddress}/treasury`,
    path: 'treasury',
  },
  proposals: {
    relative: (daoAddress: string) => `/daos/${daoAddress}/proposals`,
    path: 'proposals',
  },
  proposal: {
    relative: (daoAddress: string, proposalId: string) =>
      `/daos/${daoAddress}/proposals/${proposalId}`,
    path: '*',
  },
  proposalNew: {
    relative: (daoAddress: string) => `/daos/${daoAddress}/proposals/new`,
    path: 'new',
  },
};
