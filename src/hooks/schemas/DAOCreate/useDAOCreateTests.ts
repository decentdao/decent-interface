import { BigNumber, ethers, utils } from 'ethers';
import { useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { erc20ABI } from 'wagmi';
import { AnyObject } from 'yup';
import { logError } from '../../../helpers/errorLogging';
import { useEthersProvider } from '../../../providers/Ethers/hooks/useEthersProvider';
import { AddressValidationMap, CreatorFormState, TokenAllocation } from '../../../types';
import { couldBeENS } from '../../../utils/url';
import useSignerOrProvider from '../../utils/useSignerOrProvider';
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
  const provider = useEthersProvider();
  const signerOrProvider = useSignerOrProvider();
  const { t } = useTranslation(['daoCreate', 'common']);

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
    [t]
  );

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
            if (couldBeENS(address)) {
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
      message: t('errorAllocation'),
      test: function (value: string | undefined, context: AnyObject) {
        if (!value) return false;

        const formData: CreatorFormState = context.from.reverse()[0].value;
        const tokenSupply = formData.erc20Token.tokenSupply.bigNumberValue as BigNumber;
        const tokenAllocations = formData.erc20Token.tokenAllocations;
        const parentAllocationAmount =
          formData.erc20Token.parentAllocationAmount?.bigNumberValue || BigNumber.from(0);

        const filteredAllocations = tokenAllocations.filter(
          allocation =>
            allocation.amount.bigNumberValue && !allocation.amount.bigNumberValue.isZero()
        );

        const allocationSum = filteredAllocations.reduce(
          (prev, cur) => prev.add(cur.amount.bigNumberValue!),
          BigNumber.from(0)
        );

        const totalAllocation = allocationSum.add(parentAllocationAmount);

        if (totalAllocation.isZero() || totalAllocation.gt(tokenSupply)) {
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
      test: async function (address: string | undefined) {
        if (address && utils.isAddress(address)) {
          try {
            const tokenContract = new ethers.Contract(address, erc20ABI, provider);
            const [name, symbol, decimals] = await Promise.all([
              tokenContract.name(),
              tokenContract.symbol(),
              tokenContract.decimals(),
            ]);
            return !!name && !!symbol && !!decimals;
          } catch (error) {
            return false;
          }
        }
        return false;
      },
    };
  }, [provider, t]);

  const validERC721Address = useMemo(() => {
    return {
      name: 'ERC721 Address Validation',
      message: t('errorInvalidERC721Address', { ns: 'common' }),
      test: async function (address: string | undefined) {
        if (address && utils.isAddress(address)) {
          try {
            // We're using this instead of erc721ABI from wagmi cause that one doesn't have supportsInterface for whatever reason
            const erc165 = [
              'function supportsInterface(bytes4 interfaceID) external view returns (bool)',
            ];
            const nftContract = new ethers.Contract(address, erc165, provider);
            const supportsInterface = await nftContract.supportsInterface('0x80ac58cd'); // Exact same check we have in voting strategy contract
            return supportsInterface;
          } catch (error) {
            logError(error);
            return false;
          }
        }
        return false;
      },
    };
  }, [provider, t]);

  const isBigNumberValidation = useMemo(() => {
    return {
      name: 'BigNumber Validation',
      message: t('errorInvalidBigNumber', { ns: 'common' }),
      test: (value: string | undefined) => {
        if (!value) {
          return false;
        }
        try {
          BigNumber.from(value);
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
    isBigNumberValidation,
  };
}
