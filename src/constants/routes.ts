export const BASE_ROUTES = {
  landing: '/',
  create: '/create',
};

type RouteInfo = { relative: (...args: any) => string; path: string };
type RouteIndex = { [key: string]: RouteInfo };
export interface DAORoutes extends RouteIndex {
  dao: RouteInfo;
  newSubDao: RouteInfo;
  modifyGovernance: RouteInfo;
  hierarchy: RouteInfo;
  treasury: RouteInfo;
  proposals: RouteInfo;
  proposal: RouteInfo;
  proposalNew: RouteInfo;
  settings: RouteInfo;
  proposalTemplates: RouteInfo;
  proposalTemplate: RouteInfo;
  proposalTemplateNew: RouteInfo;
}

export const DAO_ROUTES: DAORoutes = {
  dao: {
    relative: (daoAddress: string) => `/${daoAddress}`,
    path: '*',
  },
  newSubDao: {
    relative: (daoAddress: string) => `/${daoAddress}/new`,
    path: 'new',
  },
  modifyGovernance: {
    relative: (daoAddress: string) => `/${daoAddress}/edit/governance`,
    path: 'edit/governance',
  },
  hierarchy: {
    relative: (daoAddress: string) => `/${daoAddress}/hierarchy`,
    path: 'hierarchy',
  },
  treasury: {
    relative: (daoAddress: string) => `/${daoAddress}/treasury`,
    path: 'treasury',
  },
  proposals: {
    relative: (daoAddress: string) => `/${daoAddress}/proposals`,
    path: 'proposals',
  },
  proposal: {
    relative: (daoAddress: string, proposalId: string) => `/${daoAddress}/proposals/${proposalId}`,
    path: 'proposals/:proposalId',
  },
  proposalNew: {
    relative: (daoAddress: string) => `/${daoAddress}/proposals/new`,
    path: 'proposals/new',
  },
  settings: {
    relative: (daoAddress: string) => `/${daoAddress}/settings`,
    path: 'settings',
  },
  proposalTemplates: {
    relative: (daoAddress: string) => `/${daoAddress}/proposal-templates`,
    path: 'proposal-templates',
  },
  proposalTemplate: {
    relative: (daoAddress: string, proposalTemplateKey: string) =>
      `/${daoAddress}/proposal-templates/${proposalTemplateKey}`,
    path: 'proposal-templates/:proposalTemplateKey',
  },
  proposalTemplateNew: {
    relative: (daoAddress: string) => `/${daoAddress}/proposal-templates/new`,
    path: 'proposal-templates/new',
  },
};
