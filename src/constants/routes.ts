import { Hex } from 'viem';

export const BASE_ROUTES = {
  landing: '/',
  create: '/create/essentials',
};

const getDaoQueryParam = (addressPrefix: string, daoAddress: string) =>
  `?dao=${addressPrefix}:${daoAddress}`;

const getRoleQueryParam = (addressPrefix: string, daoAddress: string, hatId: Hex) =>
  `${getDaoQueryParam(addressPrefix, daoAddress)}&hatId=${hatId}`;

export const DAO_ROUTES = {
  dao: {
    relative: (addressPrefix: string, daoAddress: string) =>
      `/home${getDaoQueryParam(addressPrefix, daoAddress)}`,
    path: 'home',
  },
  newSubDao: {
    relative: (addressPrefix: string, daoAddress: string) =>
      `/new/essentials${getDaoQueryParam(addressPrefix, daoAddress)}`,
    path: 'new/essentials',
  },
  modifyGovernance: {
    relative: (addressPrefix: string, daoAddress: string) =>
      `/edit/governance/essentials${getDaoQueryParam(addressPrefix, daoAddress)}`,
    path: 'edit/governance/essentials',
  },
  hierarchy: {
    relative: (addressPrefix: string, daoAddress: string) =>
      `/hierarchy${getDaoQueryParam(addressPrefix, daoAddress)}`,
    path: 'hierarchy',
  },
  roles: {
    relative: (addressPrefix: string, daoAddress: string) =>
      `/roles${getDaoQueryParam(addressPrefix, daoAddress)}`,
    path: 'roles',
  },
  rolesDetails: {
    relative: (addressPrefix: string, daoAddress: string, hatId: Hex) =>
      `/roles/details${getRoleQueryParam(addressPrefix, daoAddress, hatId)}`,
    path: 'roles/details',
  },
  rolesEdit: {
    relative: (addressPrefix: string, daoAddress: string) =>
      `/roles/edit${getDaoQueryParam(addressPrefix, daoAddress)}`,
    path: 'roles/edit',
  },
  rolesEditDetails: {
    relative: (addressPrefix: string, daoAddress: string, hatId: Hex) =>
      `/roles/edit/details${getRoleQueryParam(addressPrefix, daoAddress, hatId)}`,
    path: 'roles/edit/details',
  },
  rolesEditCreateProposalSummary: {
    relative: (addressPrefix: string, daoAddress: string) =>
      `/roles/edit/summary${getDaoQueryParam(addressPrefix, daoAddress)}`,
    path: 'roles/edit/summary',
  },
  treasury: {
    relative: (addressPrefix: string, daoAddress: string) =>
      `/treasury${getDaoQueryParam(addressPrefix, daoAddress)}`,
    path: 'treasury',
  },
  proposals: {
    relative: (addressPrefix: string, daoAddress: string) =>
      `/proposals${getDaoQueryParam(addressPrefix, daoAddress)}`,
    path: 'proposals',
  },
  proposal: {
    relative: (addressPrefix: string, daoAddress: string, proposalId: string) =>
      `/proposals/${proposalId}${getDaoQueryParam(addressPrefix, daoAddress)}`,
    path: 'proposals/:proposalId',
  },
  proposalNew: {
    relative: (addressPrefix: string, daoAddress: string) =>
      `/proposals/new/metadata${getDaoQueryParam(addressPrefix, daoAddress)}`,
    path: 'proposals/new/metadata',
  },
  proposalWithActionsNew: {
    relative: (addressPrefix: string, daoAddress: string) =>
      `/proposals/actions/new/metadata${getDaoQueryParam(addressPrefix, daoAddress)}`,
    path: 'proposals/actions/new/metadata',
  },
  settings: {
    relative: (addressPrefix: string, daoAddress: string) =>
      `/settings${getDaoQueryParam(addressPrefix, daoAddress)}`,
    path: 'settings',
  },
  settingsGeneral: {
    relative: (addressPrefix: string, daoAddress: string) =>
      `/settings/general${getDaoQueryParam(addressPrefix, daoAddress)}`,
    path: 'general',
  },
  settingsGovernance: {
    relative: (addressPrefix: string, daoAddress: string) =>
      `/settings/governance${getDaoQueryParam(addressPrefix, daoAddress)}`,
    path: 'governance',
  },
  settingsModulesAndGuard: {
    relative: (addressPrefix: string, daoAddress: string) =>
      `/settings/modules-and-guard${getDaoQueryParam(addressPrefix, daoAddress)}`,
    path: 'modules-and-guard',
  },
  settingsPermissions: {
    relative: (addressPrefix: string, daoAddress: string) =>
      `/settings/permissions${getDaoQueryParam(addressPrefix, daoAddress)}`,
    path: 'permissions',
  },
  settingsPermissionsCreateProposal: {
    relative: (addressPrefix: string, daoAddress: string, votingStrategyAddress?: string) =>
      `/settings/permissions/create-proposal${getDaoQueryParam(addressPrefix, daoAddress)}${votingStrategyAddress ? `&votingStrategy=${votingStrategyAddress}` : ''}`,
    path: 'create-proposal',
  },
  proposalTemplates: {
    relative: (addressPrefix: string, daoAddress: string) =>
      `/proposal-templates${getDaoQueryParam(addressPrefix, daoAddress)}`,
    path: 'proposal-templates',
  },
  proposalTemplate: {
    relative: (addressPrefix: string, daoAddress: string, proposalTemplateKey: string) =>
      `/proposal-templates/${proposalTemplateKey}${getDaoQueryParam(addressPrefix, daoAddress)}`,
    path: 'proposal-templates/:proposalTemplateKey',
  },
  proposalTemplateNew: {
    relative: (addressPrefix: string, daoAddress: string) =>
      `/proposal-templates/new/metadata${getDaoQueryParam(addressPrefix, daoAddress)}`,
    path: 'proposal-templates/new/metadata',
  },
};
