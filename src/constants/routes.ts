export const BASE_ROUTES = {
  landing: '/',
  create: '/create',
};

type RouteInfo = {
  relative: (daoNetwork: string, daoAddress: string, ...args: string[]) => string;
  path: string;
};
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
    relative: (daoNetwork: string, daoAddress: string) => `/home?dao=${daoNetwork}:${daoAddress}`,
    path: '*',
  },
  newSubDao: {
    relative: (daoNetwork: string, daoAddress: string) => `/new?dao=${daoNetwork}:${daoAddress}`,
    path: 'new',
  },
  modifyGovernance: {
    relative: (daoNetwork: string, daoAddress: string) =>
      `/edit/governance?dao=${daoNetwork}:${daoAddress}`,
    path: 'edit/governance',
  },
  hierarchy: {
    relative: (daoNetwork: string, daoAddress: string) =>
      `/hierarchy?dao=${daoNetwork}:${daoAddress}`,
    path: 'hierarchy',
  },
  treasury: {
    relative: (daoNetwork: string, daoAddress: string) =>
      `/treasury?dao=${daoNetwork}:${daoAddress}`,
    path: 'treasury',
  },
  proposals: {
    relative: (daoNetwork: string, daoAddress: string) =>
      `/proposals?dao=${daoNetwork}:${daoAddress}`,
    path: 'proposals',
  },
  proposal: {
    relative: (daoNetwork: string, daoAddress: string, proposalId: string) =>
      `/proposals/${proposalId}?dao=${daoNetwork}:${daoAddress}`,
    path: 'proposals/:proposalId',
  },
  proposalNew: {
    relative: (daoNetwork: string, daoAddress: string) =>
      `/proposals/new?dao=${daoNetwork}:${daoAddress}`,
    path: 'proposals/new',
  },
  settings: {
    relative: (daoNetwork: string, daoAddress: string) =>
      `/settings?dao=${daoNetwork}:${daoAddress}`,
    path: 'settings',
  },
  proposalTemplates: {
    relative: (daoNetwork: string, daoAddress: string) =>
      `/proposal-templates?dao=${daoNetwork}:${daoAddress}`,
    path: 'proposal-templates',
  },
  proposalTemplate: {
    relative: (daoNetwork: string, daoAddress: string, proposalTemplateKey: string) =>
      `/proposal-templates/${proposalTemplateKey}?dao=${daoNetwork}:${daoAddress}`,
    path: 'proposal-templates/:proposalTemplateKey',
  },
  proposalTemplateNew: {
    relative: (daoNetwork: string, daoAddress: string) =>
      `/proposal-templates/new?dao=${daoNetwork}:${daoAddress}`,
    path: 'proposal-templates/new',
  },
};
