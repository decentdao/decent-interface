type RouteInfo = { relative: (...args: any) => string; path: string };
type RouteIndex = { [key: string]: RouteInfo };
interface DAORoutes extends RouteIndex {
  dao: RouteInfo;
  daos: RouteInfo;
  newSubDao: RouteInfo;
  nodes: RouteInfo;
  treasury: RouteInfo;
  proposals: RouteInfo;
  proposal: RouteInfo;
  proposalNew: RouteInfo;
}

export const DAO_ROUTES: DAORoutes = {
  daos: {
    relative: () => '/daos',
    path: 'daos/:address/*',
  },
  dao: {
    relative: (daoAddress: string) => `/daos/${daoAddress}`,
    path: '*',
  },
  newSubDao: {
    relative: (daoAddress: string) => `/daos/${daoAddress}/new`,
    path: 'new',
  },
  nodes: {
    relative: (daoAddress: string) => `/daos/${daoAddress}/nodes`,
    path: 'nodes',
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
};
