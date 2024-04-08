export const BASE_ROUTES = {
  landing: '/',
  create: '/create',
};

type RouteInfo = {
  relative: (addressPrefix: string, daoAddress: string, ...args: string[]) => string;
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
    relative: (addressPrefix: string, daoAddress: string) =>
      `/home?dao=${addressPrefix}:${daoAddress}`,
    path: '*',
  },
  newSubDao: {
    relative: (addressPrefix: string, daoAddress: string) =>
      `/new?dao=${addressPrefix}:${daoAddress}`,
    path: 'new',
  },
  modifyGovernance: {
    relative: (addressPrefix: string, daoAddress: string) =>
      `/edit/governance?dao=${addressPrefix}:${daoAddress}`,
    path: 'edit/governance',
  },
  hierarchy: {
    relative: (addressPrefix: string, daoAddress: string) =>
      `/hierarchy?dao=${addressPrefix}:${daoAddress}`,
    path: 'hierarchy',
  },
  treasury: {
    relative: (addressPrefix: string, daoAddress: string) =>
      `/treasury?dao=${addressPrefix}:${daoAddress}`,
    path: 'treasury',
  },
  proposals: {
    relative: (addressPrefix: string, daoAddress: string) =>
      `/proposals?dao=${addressPrefix}:${daoAddress}`,
    path: 'proposals',
  },
  proposal: {
    relative: (addressPrefix: string, daoAddress: string, proposalId: string) =>
      `/proposals/${proposalId}?dao=${addressPrefix}:${daoAddress}`,
    path: 'proposals/:proposalId',
  },
  proposalNew: {
    relative: (addressPrefix: string, daoAddress: string) =>
      `/proposals/new?dao=${addressPrefix}:${daoAddress}`,
    path: 'proposals/new',
  },
  settings: {
    relative: (addressPrefix: string, daoAddress: string) =>
      `/settings?dao=${addressPrefix}:${daoAddress}`,
    path: 'settings',
  },
  proposalTemplates: {
    relative: (addressPrefix: string, daoAddress: string) =>
      `/proposal-templates?dao=${addressPrefix}:${daoAddress}`,
    path: 'proposal-templates',
  },
  proposalTemplate: {
    relative: (addressPrefix: string, daoAddress: string, proposalTemplateKey: string) =>
      `/proposal-templates/${proposalTemplateKey}?dao=${addressPrefix}:${daoAddress}`,
    path: 'proposal-templates/:proposalTemplateKey',
  },
  proposalTemplateNew: {
    relative: (addressPrefix: string, daoAddress: string) =>
      `/proposal-templates/new?dao=${addressPrefix}:${daoAddress}`,
    path: 'proposal-templates/new',
  },
};
