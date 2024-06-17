export const BASE_ROUTES = {
  landing: '/',
  create: '/create/essentials',
};

export const DAO_ROUTES = {
  dao: {
    relative: (addressPrefix: string, daoAddress: string) =>
      `/home?dao=${addressPrefix}:${daoAddress}`,
    path: '*',
  },
  newSubDao: {
    relative: (addressPrefix: string, daoAddress: string) =>
      `/new/essentials?dao=${addressPrefix}:${daoAddress}`,
    path: 'new/essentials',
  },
  modifyGovernance: {
    relative: (addressPrefix: string, daoAddress: string) =>
      `/edit/governance/essentials?dao=${addressPrefix}:${daoAddress}`,
    path: 'edit/governance/essentials',
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
      `/proposals/new/metadata?dao=${addressPrefix}:${daoAddress}`,
    path: 'proposals/new/metadata',
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
      `/proposal-templates/new/metadata?dao=${addressPrefix}:${daoAddress}`,
    path: 'proposal-templates/new/metadata',
  },
};
