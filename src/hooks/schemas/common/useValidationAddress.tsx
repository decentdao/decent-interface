import { Signer } from 'ethers';
import { useMemo, useRef, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { isAddress } from 'viem';
import { normalize } from 'viem/ens';
import { AnyObject } from 'yup';
import { useFractal } from '../../../providers/App/AppProvider';
import { useEthersSigner } from '../../../providers/Ethers/hooks/useEthersSigner';
import { AddressValidationMap, ERC721TokenConfig } from '../../../types';
import { Providers } from '../../../types/network';
import { validateENSName } from '../../../utils/url';
import useSignerOrProvider from '../../utils/useSignerOrProvider';

export async function validateAddress({
  signerOrProvider,
  address,
  checkENS = true,
}: {
  signerOrProvider?: Signer | Providers;
  address: string;
  checkENS?: boolean;
}) {
  if (normalize(address) && checkENS && signerOrProvider) {
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
  const isValidAddress = isAddress(address);
  if (isValidAddress) {
    return {
      validation: {
        address,
        isValidAddress,
      },
      isValid: true,
    };
  } else {
    return {
      validation: {
        address: '',
        isValidAddress,
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
  const signer = useEthersSigner();
  const signerOrProvider = useSignerOrProvider();
  const { t } = useTranslation(['daoCreate', 'common', 'modals']);
  const {
    node: { safe },
  } = useFractal();

  const [isValidating, setIsValidating] = useState(false);

  const addressValidationTest = useMemo(() => {
    return {
      name: 'Address Validation',
      message: t('errorInvalidENSAddress', { ns: 'common' }),
      test: async function (address: string | undefined) {
        if (!address) return false;
        setIsValidating(true);
        try {
          const { validation } = await validateAddress({ signerOrProvider, address });
          if (validation.isValidAddress) {
            addressValidationMap.current.set(address, validation);
          }
          return validation.isValidAddress;
        } catch (error) {
          return false;
        } finally {
          setIsValidating(false);
        }
      },
    };
  }, [signerOrProvider, addressValidationMap, t]);

  const ensNameValidationTest = useMemo(() => {
    return {
      name: 'ENS Validation',
      message: t('errorInvalidENSName', { ns: 'common' }),
      test: async function (ensName: string | undefined) {
        if (ensName === undefined) return true;
        const isValid = validateENSName(ensName);
        return isValid;
      },
    };
  }, [t]);

  const addressValidationTestSimple = useMemo(() => {
    return {
      name: 'Address Validation',
      message: t('errorInvalidAddress', { ns: 'common' }),
      test: async function (address: string | undefined) {
        if (!address) return false;
        setIsValidating(true);
        const { validation } = await validateAddress({
          signerOrProvider,
          address,
          checkENS: false,
        });
        if (validation.isValidAddress) {
          addressValidationMap.current.set(address, validation);
        }
        setIsValidating(false);
        return validation.isValidAddress;
      },
    };
  }, [signerOrProvider, addressValidationMap, t]);

  const newSignerValidationTest = useMemo(() => {
    return {
      name: 'New Signer Validation',
      message: t('alreadySigner', { ns: 'modals' }),
      test: async function (address: string | undefined) {
        if (!address || !safe || !signer) return false;
        if (normalize(address)) {
          address = await signer.resolveName(address);
        }
        return !safe.owners.includes(address);
      },
    };
  }, [safe, signer, t]);

  const testUniqueAddressArray = useCallback(
    async (value: string, addressArray: string[]) => {
      // looks up tested value
      let inputValidation = addressValidationMap.current.get(value);
      if (!!value && !inputValidation) {
        inputValidation = (await validateAddress({ signerOrProvider, address: value })).validation;
      }
      // converts all inputs to addresses to compare
      // uses addressValidationMap to save on requests
      const resolvedAddresses: string[] = await Promise.all(
        addressArray.map(async (address: string) => {
          // look up validated values
          const addressValidation = addressValidationMap.current.get(address);
          if (addressValidation && addressValidation.isValidAddress) {
            return addressValidation.address;
          }
          // because mapping is not 'state', this catches values that may not be resolved yet
          if (normalize(address)) {
            const { validation } = await validateAddress({ signerOrProvider, address });
            return validation.address;
          }
          return address;
        }),
      );

      const uniqueFilter = resolvedAddresses.filter(
        address => address === value || address === inputValidation?.address,
      );

      return uniqueFilter.length === 1;
    },
    [signerOrProvider],
  );

  const uniqueAddressValidationTest = useMemo(() => {
    return {
      name: 'Unique Addresses',
      message: t('errorDuplicateAddress'),
      test: async function (value: string | undefined, context: AnyObject) {
        if (!value) return false;
        // retreive parent array
        const parentAddressArray = context.parent;
        const isUnique = await testUniqueAddressArray(value, parentAddressArray);
        return isUnique;
      },
    };
  }, [t, testUniqueAddressArray]);

  const uniqueNFTAddressValidationTest = useMemo(() => {
    return {
      name: 'Unique Address',
      message: t('errorDuplicateAddress'),
      test: async function (value: string | undefined, context: AnyObject) {
        if (!value) return false;
        // retreive parent array
        const parentAddressArray = context.from[1].value.nfts.map(
          ({ tokenAddress }: ERC721TokenConfig) => tokenAddress,
        );
        const isUnique = await testUniqueAddressArray(value, parentAddressArray);
        return isUnique;
      },
    };
  }, [t, testUniqueAddressArray]);

  return {
    addressValidationTestSimple,
    addressValidationTest,
    ensNameValidationTest,
    newSignerValidationTest,
    uniqueAddressValidationTest,
    uniqueNFTAddressValidationTest,
    isValidating,
  };
};
