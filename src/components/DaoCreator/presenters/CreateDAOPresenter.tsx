// These are strict Typescript functions to create viewmodels from modal.
// Viewmodels are used to provide UI data to render reusable components.

import { TFunction } from 'i18next/typescript/t';
import { ChangeEvent } from 'react';
import { BigIntValuePair, GovernanceType, TokenCreationType } from '../../../types';
import { NetworkConfig } from '../../../types/network';
import { getNetworkIcon } from '../../../utils/url';

export interface IInput {
  label: string; // label
  description?: string; // optional description
}

export interface IInputRequirements {
  error?: string; // error message
  isDisabled?: boolean; // is disabled
  isRequired: boolean; // is required
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

export interface ISelectionInput extends IInput, IInputRequirements, ITextValueChange {
  id: string; // id of the input
  selected?: string; // selected item
  options: ISelectionOption[]; // list of options
}

export interface ITextInput extends ITextValueChange, IInputRequirements {
  id: string; // id of the input
  fieldName?: string; // key path for Formik,
  value?: string; // current value
  placeholder?: string; // placeholder
  testId?: string; // optional test id
}

export interface IRemoval {
  removalLabel?: string;
  removalIndex: number;
  onRemoval?: (index: number) => void; // on removal button is clicked
}

export interface ILabeledTextInput extends IInput, ITextInput {}

export interface IBigIntTextInput extends IInputRequirements {
  id: string; // id of the input
  fieldName?: string; // key path for Formik,
  value?: bigint; // current value
  placeholder: string; // placeholder
  testId?: string; // optional test id
  min?: string; // min value
  max?: string; // max value
  decimalPlaces?: number; // decimal places
  suffix?: string; // suffix
  onValueChange?: (value: BigIntValuePair) => void; // on change callback with input value
}

export interface ILabeledBigIntTextInput extends IInput, IBigIntTextInput {}

export interface IInputSection {
  label?: string; // title of the section
}

export interface IStepperInput extends IInput {
  id: string; // id of the input
  unit?: string; // stepper unit
  value: number; // current value
  onValueChange?: (value: number) => void; // on change callback with input value
}

export const CreateDAOPresenter = {
  daoname(
    t: TFunction<[string, string], undefined>,
    isDisabled: boolean,
    onValueChange: (value: string) => void,
  ): ILabeledTextInput {
    return {
      id: 'essentials-daoName',
      label: t('labelDAOName'),
      description: t('helperDAOName'),
      placeholder: t('daoNamePlaceholder'),
      fieldName: 'essentials.daoName',
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
      isRequired: true,
      options: options,
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
      isRequired: true,
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
      onValueChange: value => {
        const governanceType = value as GovernanceType;
        onValueChange(governanceType);
      },
    };
  },

  snapshot(
    t: TFunction<[string, string], undefined>,
    isDisabled: boolean,
    error: string | undefined,
    onValueChange: (value: string) => void,
  ): ILabeledTextInput {
    return {
      id: 'snapshot',
      label: t('snapshot'),
      description: t('snapshotHelper'),
      placeholder: 'example.eth',
      error: error,
      fieldName: 'essentials.snapshotENS',
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
      isRequired: true,
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
      onValueChange: value => {
        const tokenCreationType = value as TokenCreationType;
        onValueChange(tokenCreationType);
      },
    };
  },

  tokenImportAddress(
    t: TFunction<[string, string], undefined>,
    placeholder: string,
    error: string | undefined,
    onChange: (event: ChangeEvent<HTMLInputElement>) => void,
  ): ILabeledTextInput {
    return {
      id: 'erc20Token.tokenImportAddress',
      label: '',
      placeholder: placeholder,
      error: error,
      fieldName: 'erc20Token.tokenImportAddress',
      isRequired: true,
      onChange: onChange,
    };
  },

  tokenNew(t: TFunction<[string, string], undefined>): ILabeledTextInput {
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
    isDisabled: boolean,
    onValueChange: (value: string) => void,
  ): ILabeledTextInput {
    return {
      id: 'erc20Token.tokenName',
      label: t('labelTokenName'),
      description: t('helperTokenName'),
      placeholder: 'Name',
      fieldName: 'erc20Token.tokenName',
      isDisabled: isDisabled,
      isRequired: true,
      testId: 'tokenVoting-tokenNameInput',
      onValueChange: onValueChange,
    };
  },

  tokenSymbol(
    t: TFunction<[string, string], undefined>,
    isDisabled: boolean,
    onChange: (event: ChangeEvent<HTMLInputElement>) => void,
  ): ILabeledTextInput {
    return {
      id: 'erc20Token.tokenSymbol',
      label: t('labelTokenSymbol'),
      description: t('helperTokenSymbol'),
      placeholder: 'TKN',
      fieldName: 'erc20Token.tokenSymbol',
      isDisabled: isDisabled,
      isRequired: true,
      testId: 'tokenVoting-tokenSymbolInput',
      onChange: onChange,
    };
  },

  tokenSupply(
    t: TFunction<[string, string], undefined>,
    value: bigint | undefined,
    isDisabled: boolean,
    onValueChange: (value: BigIntValuePair) => void,
  ): ILabeledBigIntTextInput {
    return {
      id: 'erc20Token.tokenSupply',
      label: t('labelTokenSupply'),
      description: t('helperTokenSupply'),
      placeholder: '100,000,000',
      value: value,
      isDisabled: isDisabled,
      isRequired: true,
      testId: 'tokenVoting-tokenSupplyInput',
      onValueChange: onValueChange,
    };
  },

  section(label?: string): IInputSection {
    return {
      label: label,
    };
  },

  erc20Quorum(
    t: TFunction<[string, string], undefined>,
    value: bigint | undefined,
    onValueChange: (value: BigIntValuePair) => void,
  ): ILabeledBigIntTextInput {
    return {
      id: 'erc20Token.quorum',
      label: t('quorum', { ns: 'common' }),
      description: t('helperQuorumERC20'),
      placeholder: '',
      value: value,
      max: '100',
      decimalPlaces: 0,
      suffix: '%',
      isDisabled: false,
      isRequired: true,
      testId: 'govConfig-quorumPercentage',
      onValueChange: onValueChange,
    };
  },

  erc721Quorum(
    t: TFunction<[string, string], undefined>,
    value: bigint | undefined,
    onValueChange: (value: BigIntValuePair) => void,
  ): ILabeledBigIntTextInput {
    return {
      id: 'erc20Token.quorum',
      label: t('quorum', { ns: 'common' }),
      description: t('helperQuorumERC721'),
      placeholder: '',
      value: value,
      min: '1',
      decimalPlaces: 0,
      isDisabled: false,
      isRequired: true,
      testId: 'govConfig-quorumThreshold',
      onValueChange: onValueChange,
    };
  },

  votingPeriod(
    t: TFunction<[string, string], undefined>,
    value: number,
    onValueChange: (value: number) => void,
  ): IStepperInput {
    return {
      id: 'votingPeriod',
      label: t('labelVotingPeriod'),
      description: t('helperVotingPeriod'),
      unit: t('days', { ns: 'common' }),
      value: value,
      onValueChange: onValueChange,
    };
  },

  timelockPeriod(
    t: TFunction<[string, string], undefined>,
    value: number,
    onValueChange: (value: number) => void,
  ): IStepperInput {
    return {
      id: 'timelockPeriod',
      label: t('labelTimelockPeriod'),
      description: t('helperTimelockPeriod'),
      unit: t('days', { ns: 'common' }),
      value: value,
      onValueChange: onValueChange,
    };
  },

  executionPeriod(
    t: TFunction<[string, string], undefined>,
    value: number,
    onValueChange: (value: number) => void,
  ): IStepperInput {
    return {
      id: 'votingPeriod',
      label: t('labelExecutionPeriod'),
      description: t('helperExecutionPeriod'),
      unit: t('days', { ns: 'common' }),
      value: value,
      onValueChange: onValueChange,
    };
  },

  multiSignOwners(t: TFunction<[string, string], undefined>): IInput & IInputRequirements {
    return {
      label: t('titleSignerAddresses'),
      description: t('subTitleSignerAddresses'),
      isRequired: true,
    };
  },

  multiSign(
    t: TFunction<[string, string], undefined>,
    index: number,
    error: string | undefined,
    onValueChange: (value: string) => void,
    onRemoval: (index: number) => void,
  ): ITextInput & IInputRequirements & IRemoval {
    return {
      id: `multiSigOwner${index}`,
      fieldName: `multisig.trustedAddresses.${index}`,
      testId: `safeConfig-signer-${index}`,
      error: error,
      isRequired: true,
      removalIndex: index,
      removalLabel: t('removeSigner'),
      onValueChange: onValueChange,
      onRemoval: onRemoval,
    };
  },
};
