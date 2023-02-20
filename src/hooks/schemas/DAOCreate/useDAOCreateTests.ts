import { BigNumber } from 'ethers';
import { useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useProvider, useSigner } from 'wagmi';
import { AnyObject } from 'yup';
import { AddressValidationMap, CreatorFormState } from '../../../components/DaoCreator/types';
import { TokenAllocation } from '../../../types';
import { validateAddress } from '../common/useValidationAddress';

/**
 * validatation tests for create DAO workflow; specifically token allocations
 */
export function useDAOCreateTests() {
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
  const { t } = useTranslation(['daoCreate', 'common']);

  const allocationValidationTest = useMemo(() => {
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

  const uniqueAllocationValidationTest = useMemo(() => {
    return {
      name: 'Unique Addresses',
      message: t('errorDuplicateAddress'),
      test: async function (value: string | undefined, context: AnyObject) {
        if (!value) return false;
        // retreive parent array
        const parentAddressArray = context.from[1].value.tokenAllocations;
        if (parentAddressArray.length === 1) {
          return true;
        }
        // looks up tested value
        let inputValidation = addressValidationMap.current.get(value);
        if (!!value && !inputValidation) {
          inputValidation = (await validateAddress({ signerOrProvider, address: value }))
            .validation;
        }
        // converts all inputs to addresses to compare
        // uses addressValidationMap to save on requests
        const resolvedAddresses: string[] = await Promise.all(
          parentAddressArray.map(async ({ address }: TokenAllocation) => {
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
  const maxAllocationValidation = useMemo(() => {
    return {
      name: 'Token Supply validation',
      message: t('errorOverallocated'),
      test: function (value: string | undefined, context: AnyObject) {
        if (!value) return false;

        const formData: CreatorFormState = context.from.reverse()[0].value;
        const tokenSupply = formData.govToken.tokenSupply.bigNumberValue as BigNumber;
        const tokenAllocations = formData.govToken.tokenAllocations;
        const parentAllocationAmount =
          formData.govToken.parentAllocationAmount?.bigNumberValue || BigNumber.from(0);

        const filteredAllocations = tokenAllocations.filter(
          allocation =>
            allocation.amount.bigNumberValue && !allocation.amount.bigNumberValue.isZero()
        );

        const allocationSum = filteredAllocations.reduce(
          (prev, cur) => prev.add(cur.amount.bigNumberValue!),
          BigNumber.from(0)
        );

        if (allocationSum.isZero() || allocationSum.add(parentAllocationAmount).gt(tokenSupply)) {
          return false;
        }
        return true;
      },
    };
  }, [t]);
  return { maxAllocationValidation, allocationValidationTest, uniqueAllocationValidationTest };
}
