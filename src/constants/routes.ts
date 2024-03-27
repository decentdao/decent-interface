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
    relative: (daoAddress: string) => `/home?dao=${daoAddress}`,
    path: '*',
  },
  newSubDao: {
    relative: (daoAddress: string) => `/new?dao=${daoAddress}`,
    path: 'new',
  },
  modifyGovernance: {
    relative: (daoAddress: string) => `/edit/governance?dao=${daoAddress}`,
    path: 'edit/governance',
  },
  hierarchy: {
    relative: (daoAddress: string) => `/hierarchy?dao=${daoAddress}`,
    path: 'hierarchy',
  },
  treasury: {
    relative: (daoAddress: string) => `/treasury?dao=${daoAddress}`,
    path: 'treasury',
  },
  proposals: {
    relative: (daoAddress: string) => `/proposals?dao=${daoAddress}`,
    path: 'proposals',
  },
  proposal: {
    relative: (daoAddress: string, proposalId: string) =>
      `/proposals/${proposalId}?dao=${daoAddress}`,
    path: 'proposals/:proposalId',
  },
  proposalNew: {
    relative: (daoAddress: string) => `/proposals/new?dao=${daoAddress}`,
    path: 'proposals/new',
  },
  settings: {
    relative: (daoAddress: string) => `/settings?dao=${daoAddress}`,
    path: 'settings',
  },
  proposalTemplates: {
    relative: (daoAddress: string) => `/proposal-templates?dao=${daoAddress}`,
    path: 'proposal-templates',
  },
  proposalTemplate: {
    relative: (daoAddress: string, proposalTemplateKey: string) =>
      `/proposal-templates/${proposalTemplateKey}?dao=${daoAddress}`,
    path: 'proposal-templates/:proposalTemplateKey',
  },
  proposalTemplateNew: {
    relative: (daoAddress: string) => `/proposal-templates/new?dao=${daoAddress}`,
    path: 'proposal-templates/new',
  },
};
