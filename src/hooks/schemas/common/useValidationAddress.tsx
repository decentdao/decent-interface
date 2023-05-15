import { Signer, utils } from 'ethers';
import { useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useProvider, useSigner } from 'wagmi';
import { AnyObject } from 'yup';
import { useFractal } from '../../../providers/App/AppProvider';
import { AddressValidationMap } from '../../../types';
import { Providers } from '../../../types/network';

export async function validateENSName({
  signerOrProvider,
  ensName,
}: {
  signerOrProvider: Signer | Providers;
  ensName: string;
}) {
  if (!!ensName && ensName.trim() && ensName.endsWith('.eth')) {
    const resolvedAddress = await signerOrProvider.resolveName(ensName).catch();
    if (resolvedAddress) {
      return {
        validation: {
          address: resolvedAddress,
          isValidAddress: true,
        },
        isValid: false,
      };
    }
  }
  return {
    validation: {
      address: '',
      isValidAddress: false,
    },
    isValid: false,
  };
}

export async function validateAddress({
  signerOrProvider,
  address,
  checkENS = true,
}: {
  signerOrProvider: Signer | Providers;
  address: string;
  checkENS?: boolean;
}) {
  if (!!address && address.trim() && address.endsWith('.eth') && checkENS) {
    const resolvedAddress = await signerOrProvider.resolveName(address).catch();
    if (resolvedAddress) {
      return {
        validation: {
          address: resolvedAddress,
          isValidAddress: true,
        },
        isValid: false,
      };
    } else {
      return {
        validation: {
          address: '',
          isValidAddress: false,
        },
        isValid: false,
      };
    }
  }
  const isValidAddress = utils.isAddress(address);
  if (isValidAddress) {
    return {
      validation: {
        address: address,
        isValidAddress: true,
      },
      isValid: true,
    };
  } else {
    return {
      validation: {
        address: '',
        isValidAddress: false,
      },
      isValid: false,
    };
  }
}

export const useValidationAddress = () => {
  /**
   * addressValidationMap
   * @description holds ENS resolved addresses
   * @dev updated via the `addressValidation`
   * @dev this is used for any other functions contained within this hook, to lookup resolved addresses in this session without requesting again.
   */
  const addressValidationMap = useRef<AddressValidationMap>(new Map());
  const provider = useProvider();
  const { data: signer } = useSigner();
  const signerOrProvider = signer || provider;
  const { t } = useTranslation(['daoCreate', 'common', 'modals']);
  const {
    node: { safe },
  } = useFractal();

  const addressValidationTest = useMemo(() => {
    return {
      name: 'Address Validation',
      message: t('errorInvalidENSAddress', { ns: 'common' }),
      test: async function (address: string | undefined) {
        if (!address) return false;
        const { validation } = await validateAddress({ signerOrProvider, address });
        if (validation.isValidAddress) {
          addressValidationMap.current.set(address, validation);
        }
        return validation.isValidAddress;
      },
    };
  }, [signerOrProvider, addressValidationMap, t]);

  const ensNameValidationTest = useMemo(() => {
    return {
      name: 'ENS Name Validation',
      // @todo: update this string
      message: t('errorInvalidENSAddress', { ns: 'common' }),
      test: async function (ensName: string | undefined) {
        if (!ensName) return false;
        const { validation } = await validateENSName({ signerOrProvider, ensName });
        if (validation.isValidAddress) {
          addressValidationMap.current.set(ensName, validation);
        }
        return validation.isValidAddress;
      },
    };
  }, [signerOrProvider, addressValidationMap, t]);

  const addressValidationTestSimple = useMemo(() => {
    return {
      name: 'Address Validation',
      message: t('errorInvalidAddress', { ns: 'common' }),
      test: async function (address: string | undefined) {
        if (!address) return false;
        const { validation } = await validateAddress({
          signerOrProvider,
          address,
          checkENS: false,
        });
        if (validation.isValidAddress) {
          addressValidationMap.current.set(address, validation);
        }
        return validation.isValidAddress;
      },
    };
  }, [signerOrProvider, addressValidationMap, t]);

  const newSignerValidationTest = useMemo(() => {
    return {
      name: 'New Signer Validation',
      message: t('alreadySigner', { ns: 'modals' }),
      test: async function (address: string | undefined) {
        if (!address || !safe) return false;
        return !safe.owners.includes(address);
      },
    };
  }, [safe, t]);

  const uniqueAddressValidationTest = useMemo(() => {
    return {
      name: 'Unique Addresses',
      message: t('errorDuplicateAddress'),
      test: async function (value: string | undefined, context: AnyObject) {
        if (!value) return false;
        // retreive parent array
        const parentAddressArray = context.parent;

        // looks up tested value
        let inputValidation = addressValidationMap.current.get(value);
        if (!!value && !inputValidation) {
          inputValidation = (await validateAddress({ signerOrProvider, address: value }))
            .validation;
        }
        // converts all inputs to addresses to compare
        // uses addressValidationMap to save on requests
        const resolvedAddresses: string[] = await Promise.all(
          parentAddressArray.map(async (address: string) => {
            // look up validated values
            const addressValidation = addressValidationMap.current.get(address);
            if (addressValidation && addressValidation.isValidAddress) {
              return addressValidation.address;
            }
            // because mapping is not 'state', this catches values that may not be resolved yet
            if (address && address.endsWith('.eth')) {
              const { validation } = await validateAddress({ signerOrProvider, address });
              return validation.address;
            }
            return address;
          })
        );

        const uniqueFilter = resolvedAddresses.filter(
          address => address === value || address === inputValidation?.address
        );

        return uniqueFilter.length === 1;
      },
    };
  }, [signerOrProvider, t]);

  return {
    addressValidationTestSimple,
    addressValidationTest,
    ensNameValidationTest,
    newSignerValidationTest,
    uniqueAddressValidationTest,
  };
};
