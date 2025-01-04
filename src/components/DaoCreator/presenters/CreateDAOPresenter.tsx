// These are strict Typescript functions to create viewmodels from modal.
// Viewmodels are used to provide UI data to render reusable components.

import { TFunction } from 'i18next/typescript/t';
import { ChangeEvent } from 'react';
import { BigIntValuePair, GovernanceType, TokenCreationType } from '../../../types';
import { NetworkConfig } from '../../../types/network';
import { getNetworkIcon } from '../../../utils/url';

export interface IInput {
  id: string; // id
  label: string; // label
  description?: string; // optional description
  isDisabled?: boolean; // is disabled
}

export interface ITextValueChange {
  onValueChange?: (value: string) => void; // on change callback with input value
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void; // on change callback with the raw event
}

export interface ISelectionOption {
  value: string; // value of the item
  label: string; // label of the item
  description?: string; // optional description
  icon?: string; // optional icon of the item
  testId?: string; // optional test id
}

export interface ISelectionInput extends IInput, ITextValueChange {
  selected?: string; // selected item
  options: ISelectionOption[]; // list of options
}

export interface ITextInput extends IInput, ITextValueChange {
  value?: string; // current value
  placeholder: string; // placeholder
  error?: string; // error message
  isRequired: boolean; // is required
  testId?: string; // optional test id
}

export interface IBigIntTextInput extends IInput {
  value?: bigint; // current value
  placeholder: string; // placeholder
  error?: string; // error message
  isRequired: boolean; // is required
  testId?: string; // optional test id
  onValueChange?: (value: BigIntValuePair) => void; // on change callback with input value
}

export const CreateDAOPresenter = {
  daoname(
    t: TFunction<[string, string], undefined>,
    value: string,
    isDisabled: boolean,
    onValueChange: (value: string) => void,
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
      onValueChange: onValueChange,
    };
  },

  chainOptions(
    t: TFunction<[string, string], undefined>,
    networks: NetworkConfig[],
    selected: Number,
    onValueChange: (value: Number) => void,
  ): ISelectionInput {
    const options = networks.map(network => ({
      value: network.chain.id.toString(),
      label: network.chain.name,
      icon: getNetworkIcon(network.addressPrefix),
      selected: selected === network.chain.id,
    }));

    return {
      id: 'chain',
      label: t('networks'),
      description: t('networkDescription'),
      selected: selected.toString(),
      options: options,
      isDisabled: false,
      onValueChange: value => {
        onValueChange(Number(value));
      },
    };
  },

  governanceOptions(
    t: TFunction<[string, string], undefined>,
    selected: GovernanceType,
    onValueChange: (value: GovernanceType) => void,
  ): ISelectionInput {
    return {
      id: 'governance',
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
      onValueChange: value => {
        const governanceType = value as GovernanceType;
        onValueChange(governanceType);
      },
    };
  },

  snapshot(
    t: TFunction<[string, string], undefined>,
    value: string,
    isDisabled: boolean,
    error: string | undefined,
    onValueChange: (value: string) => void,
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
      onValueChange: onValueChange,
    };
  },

  tokenOptions(
    t: TFunction<[string, string], undefined>,
    selected: TokenCreationType,
    onValueChange: (value: TokenCreationType) => void,
  ): ISelectionInput {
    return {
      id: 'tokenContract',
      label: '',
      selected: selected,
      options: [
        {
          label: t('radioLabelExistingToken'),
          description: t('helperExistingToken'),
          testId: 'choose-existingToken',
          value: TokenCreationType.IMPORTED,
        },
        {
          label: t('radioLabelNewToken'),
          description: t('helperNewToken'),
          testId: 'choose-newToken',
          value: TokenCreationType.NEW,
        },
      ],
      isDisabled: false,
      onValueChange: value => {
        const tokenCreationType = value as TokenCreationType;
        onValueChange(tokenCreationType);
      },
    };
  },

  tokenImportAddress(
    t: TFunction<[string, string], undefined>,
    placeholder: string,
    value: string | undefined,
    error: string | undefined,
    onChange: (event: ChangeEvent<HTMLInputElement>) => void,
  ): ITextInput {
    return {
      id: 'erc20Token.tokenImportAddress',
      label: '',
      placeholder: placeholder,
      error: error,
      value: value,
      isRequired: true,
      onChange: onChange,
    };
  },

  tokenNew(t: TFunction<[string, string], undefined>): ITextInput {
    return {
      id: 'erc20Token.tokenName',
      label: t('labelTokenName'),
      description: t('helperTokenName'),
      placeholder: 'Name',
      isRequired: true,
    };
  },

  tokenName(
    t: TFunction<[string, string], undefined>,
    value: string,
    onValueChange: (value: string) => void,
  ): ITextInput {
    return {
      id: 'erc20Token.tokenName',
      label: t('labelTokenName'),
      description: t('helperTokenName'),
      placeholder: 'Name',
      value: value,
      isDisabled: false,
      isRequired: true,
      testId: 'tokenVoting-tokenNameInput',
      onValueChange: onValueChange,
    };
  },

  tokenSymbol(
    t: TFunction<[string, string], undefined>,
    value: string,
    onChange: (event: ChangeEvent<HTMLInputElement>) => void,
  ): ITextInput {
    return {
      id: 'erc20Token.tokenSymbol',
      label: t('labelTokenSymbol'),
      description: t('helperTokenSymbol'),
      placeholder: 'TKN',
      value: value,
      isDisabled: false,
      isRequired: true,
      testId: 'tokenVoting-tokenSymbolInput',
      onChange: onChange,
    };
  },

  tokenSupply(
    t: TFunction<[string, string], undefined>,
    value: bigint | undefined,
    onValueChange: (value: BigIntValuePair) => void,
  ): IBigIntTextInput {
    return {
      id: 'erc20Token.tokenSymbol',
      label: t('labelTokenSupply'),
      description: t('helperTokenSupply'),
      placeholder: '100,000,000',
      value: value,
      isDisabled: false,
      isRequired: true,
      testId: 'tokenVoting-tokenSupplyInput',
      onValueChange: onValueChange,
    };
  },
};
