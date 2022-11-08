export const DAO_ROUTES = {
  dao: {
    relative: (daoAddress: string) => `/daos/${daoAddress}`,
    path: ':address/*',
  },
  new: {
    relative: 'daos/new',
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
    relative: (daoAddress: string, proposalNumber: string) =>
      `/daos/${daoAddress}/proposals/${proposalNumber}`,
    path: 'proposals/:proposalNumber',
  },
  proposalNew: {
    relative: (daoAddress: string) => `/daos/${daoAddress}/proposals/new`,
    path: 'proposals/new',
  },
  proposalSubDao: {
    relative: (daoAddress: string) => `/daos/${daoAddress}/proposals/new/subdao`,
    path: 'proposals/new/subdao',
  },
};
