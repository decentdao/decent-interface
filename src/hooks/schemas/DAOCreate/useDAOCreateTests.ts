import { useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Address, erc20Abi, getContract, isAddress } from 'viem';
import { usePublicClient } from 'wagmi';
import { AnyObject } from 'yup';
import { logError } from '../../../helpers/errorLogging';
import { AddressValidationMap, CreatorFormState, TokenAllocation } from '../../../types';
import { couldBeENS } from '../../../utils/url';
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
  const { t } = useTranslation(['daoCreate', 'common']);
  const publicClient = usePublicClient();

  const minValueValidation = useMemo(
    () => (minValue: number) => {
      return {
        name: 'Minimum value validation',
        message: t('errorMinimumValue', { ns: 'common', minValue }),
        test: function (value: string | undefined) {
          if (value && Number(value) >= minValue) {
            return true;
          }
          return false;
        },
      };
    },
    [t],
  );

  const allocationValidationTest = useMemo(() => {
    return {
      name: 'Address Validation',
      message: t('errorInvalidENSAddress', { ns: 'common' }),
      test: async function (address: string | undefined) {
        if (!address) return false;
        const { validation } = await validateAddress({ publicClient, address });
        if (validation.isValidAddress) {
          addressValidationMap.current.set(address, validation);
        }
        return validation.isValidAddress;
      },
    };
  }, [publicClient, addressValidationMap, t]);

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
          inputValidation = (await validateAddress({ publicClient, address: value })).validation;
        }
        // converts all inputs to addresses to compare
        // uses addressValidationMap to save on requests
        const resolvedAddresses: string[] = await Promise.all(
          parentAddressArray.map(async ({ address }: TokenAllocation) => {
            // look up validated values
            const addressValidation = addressValidationMap.current.get(address!);
            if (addressValidation && addressValidation.isValidAddress) {
              return addressValidation.address;
            }
            // because mapping is not 'state', this catches values that may not be resolved yet
            if (couldBeENS(address)) {
              const { validation } = await validateAddress({ publicClient, address: address! });
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
    };
  }, [publicClient, t]);
  const maxAllocationValidation = useMemo(() => {
    return {
      name: 'Token Supply validation',
      message: t('errorAllocation'),
      test: function (value: string | undefined, context: AnyObject) {
        if (!value) return false;

        const formData: CreatorFormState = context.from.reverse()[0].value;
        const tokenSupply = formData.erc20Token.tokenSupply.bigintValue;
        const tokenAllocations = formData.erc20Token.tokenAllocations;
        const parentAllocationAmount =
          formData.erc20Token.parentAllocationAmount?.bigintValue || 0n;

        const filteredAllocations = tokenAllocations.filter(
          allocation => allocation.amount.bigintValue && allocation.amount.bigintValue !== 0n,
        );

        const allocationSum = filteredAllocations.reduce(
          (prev, cur) => prev + (cur.amount.bigintValue || 0n),
          0n,
        );

        const totalAllocation = allocationSum + parentAllocationAmount;

        if (!tokenSupply || totalAllocation === 0n || totalAllocation > tokenSupply) {
          return false;
        }
        return true;
      },
    };
  }, [t]);

  const validERC20Address = useMemo(() => {
    return {
      name: 'ERC20 Address Validation',
      message: t('errorInvalidERC20Address', { ns: 'common' }),
      test: async function (address: Address | undefined) {
        if (address && isAddress(address) && publicClient) {
          try {
            const tokenContract = getContract({ address, abi: erc20Abi, client: publicClient });
            const [name, symbol, decimals] = await Promise.all([
              tokenContract.read.name(),
              tokenContract.read.symbol(),
              tokenContract.read.decimals(),
            ]);
            return !!name && !!symbol && !!decimals;
          } catch (error) {
            return false;
          }
        }
        return false;
      },
    };
  }, [publicClient, t]);

  const validERC721Address = useMemo(() => {
    return {
      name: 'ERC721 Address Validation',
      message: t('errorInvalidERC721Address', { ns: 'common' }),
      test: async function (address: string | undefined) {
        if (address && isAddress(address) && publicClient) {
          try {
            // We're using this instead of erc721ABI from wagmi cause that one doesn't have supportsInterface for whatever reason
            const erc165 = [
              'function supportsInterface(bytes4 interfaceID) external view returns (bool)',
            ];
            const nftContract = getContract({ address, abi: erc165, client: publicClient });
            const supportsInterface = await nftContract.read.supportsInterface(['0x80ac58cd']); // Exact same check we have in voting strategy contract
            return supportsInterface;
          } catch (error) {
            logError(error);
            return false;
          }
        }
        return false;
      },
    };
  }, [publicClient, t]);

  const isBigIntValidation = useMemo(() => {
    return {
      name: 'Bigint Validation',
      message: t('errorInvalidBigint', { ns: 'common' }),
      test: (value: string | undefined) => {
        if (!value) {
          return false;
        }
        try {
          BigInt(value);
          return true;
        } catch (e) {
          return false;
        }
      },
    };
  }, [t]);

  return {
    minValueValidation,
    maxAllocationValidation,
    allocationValidationTest,
    uniqueAllocationValidationTest,
    validERC20Address,
    validERC721Address,
    isBigIntValidation,
  };
}
