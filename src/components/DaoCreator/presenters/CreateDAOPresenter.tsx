// These are strict Typescript functions to create viewmodels from modal.
// Viewmodels are used to provide UI data to render reusable components.

import { TFunction } from 'i18next/typescript/t';
import { GovernanceType } from '../../../types';
import { NetworkConfig } from '../../../types/network';
import { getNetworkIcon } from '../../../utils/url';

export interface IInput {
  label: string; // label
  description?: string; // optional description
  isDisabled?: boolean; // is disabled
  onChange: (value: string) => void; // on change callback
}

export interface ISelectionOption {
  value: string; // value of the item
  label: string; // label of the item
  description?: string; // optional description
  icon?: string; // optional icon of the item
  testId?: string; // optional test id
}

export interface ISelectionInput extends IInput {
  selected?: string; // selected item
  options: ISelectionOption[]; // list of options
}

export interface ITextInput extends IInput {
  id: string; // id
  value: string; // current value
  placeholder: string; // placeholder
  error?: string; // error message
  isRequired: boolean; // is required
  testId?: string; // optional test id
}

export const CreateDAOPresenter = {
  daoname(
    t: TFunction<[string, string], undefined>,
    value: string,
    isDisabled: boolean,
    onChange: (value: string) => void,
  ): ITextInput {
    return {
      id: 'essentials-daoName',
      label: t('labelDAOName'),
      description: t('helperDAOName'),
      placeholder: t('daoNamePlaceholder'),
      value: value,
      isDisabled: isDisabled,
      isRequired: true,
      testId: 'essentials-daoName',
      onChange: onChange,
    };
  },

  chainOptions(
    t: TFunction<[string, string], undefined>,
    networks: NetworkConfig[],
    selected: Number,
    onChange: (value: Number) => void,
  ): ISelectionInput {
    const options = networks.map(network => ({
      value: network.chain.id.toString(),
      label: network.chain.name,
      icon: getNetworkIcon(network.addressPrefix),
      selected: selected === network.chain.id,
    }));

    return {
      label: t('networks'),
      description: t('networkDescription'),
      selected: selected.toString(),
      options: options,
      isDisabled: false,
      onChange: value => {
        onChange(Number(value));
      },
    };
  },

  governanceOptions(
    t: TFunction<[string, string], undefined>,
    selected: GovernanceType,
    onChange: (value: GovernanceType) => void,
  ): ISelectionInput {
    return {
      label: t('labelChooseGovernance'),
      description: t('helperChooseGovernance'),
      selected: selected,
      options: [
        {
          label: t('labelAzoriusErc20Gov'),
          description: t('descAzoriusErc20Gov'),
          testId: 'choose-azorius',
          value: GovernanceType.AZORIUS_ERC20,
        },
        {
          label: t('labelAzoriusErc721Gov'),
          description: t('descAzoriusErc721Gov'),
          testId: 'choose-azorius-erc721',
          value: GovernanceType.AZORIUS_ERC721,
        },
        {
          label: t('labelMultisigGov'),
          description: t('descMultisigGov'),
          testId: 'choose-multisig',
          value: GovernanceType.MULTISIG,
        },
      ],
      isDisabled: false,
      onChange: value => {
        const governanceType = value as GovernanceType;
        onChange(governanceType);
      },
    };
  },

  snapshot(
    t: TFunction<[string, string], undefined>,
    value: string,
    isDisabled: boolean,
    error: string | undefined,
    onChange: (value: string) => void,
  ): ITextInput {
    return {
      id: 'snapshot',
      label: t('snapshot'),
      description: t('snapshotHelper'),
      placeholder: 'example.eth',
      error: error,
      value: value,
      isDisabled: isDisabled,
      isRequired: false,
      testId: 'essentials-snapshotENS',
      onChange: onChange,
    };
  },
};
