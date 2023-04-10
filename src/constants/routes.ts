export const BASE_ROUTES = {
  landing: '/',
  create: '/create',
};

type RouteInfo = { relative: (...args: any) => string; path: string };
type RouteIndex = { [key: string]: RouteInfo };
export interface DAORoutes extends RouteIndex {
  dao: RouteInfo;
  daos: RouteInfo;
  newSubDao: RouteInfo;
  hierarchy: RouteInfo;
  treasury: RouteInfo;
  proposals: RouteInfo;
  proposal: RouteInfo;
  proposalNew: RouteInfo;
  proposalTemplates: RouteInfo;
  proposalTemplate: RouteInfo;
  proposalTemplateNew: RouteInfo;
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
  hierarchy: {
    relative: (daoAddress: string) => `/daos/${daoAddress}/hierarchy`,
    path: 'hierarchy',
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
  proposalTemplates: {
    relative: (daoAddress: string) => `/daos/${daoAddress}/proposal-templates`,
    path: 'proposal-templates',
  },
  proposalTemplate: {
    relative: (daoAddress: string, proposalTemplateKey: string) =>
      `/daos/${daoAddress}/proposal-templates/${proposalTemplateKey}`,
    path: 'proposal-templates/:proposalTemplateKey',
  },
  proposalTemplateNew: {
    relative: (daoAddress: string) => `/daos/${daoAddress}/proposal-templates/new`,
    path: 'proposal-templates/new',
  },
};
