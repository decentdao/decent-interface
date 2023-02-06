import { utils } from 'ethers';
import { useMemo, useRef } from 'react';
import { useProvider } from 'wagmi';
import { AddressValidationMap } from '../provider/types';

export const useValidationAddress = () => {
  const provider = useProvider();
  const addressValidationMap = useRef<AddressValidationMap>(new Map());

  const addressArrValidationTest = useMemo(() => {
    return {
      test: async (addressArr: string[] | undefined) => {
        if (!addressArr || !addressArr.length) return false;
        addressValidationMap.current.clear();
        const validationArray = await Promise.all(
          addressArr.map(async (inputValue, index) => {
            if (!!inputValue && inputValue.trim() && inputValue.endsWith('.eth')) {
              const resolvedAddress = await provider.resolveName(inputValue).catch();
              if (resolvedAddress) {
                addressValidationMap.current.set(inputValue, {
                  address: resolvedAddress,
                  index,
                  isValidAddress: true,
                  errorMessage: null,
                });
                return true;
              } else {
                addressValidationMap.current.set(inputValue, {
                  address: '',
                  index,
                  isValidAddress: false,
                  errorMessage: 'Invalid ENS Address',
                });
                return false;
              }
            }
            const isValidAddress = utils.isAddress(inputValue);
            if (isValidAddress) {
              addressValidationMap.current.set(inputValue, {
                address: inputValue,
                index,
                isValidAddress: true,
                errorMessage: null,
              });
              return true;
            } else {
              addressValidationMap.current.set(inputValue, {
                address: '',
                index,
                isValidAddress: false,
                errorMessage: 'Invalid address',
              });
            }
            return false;
          })
        );
        return validationArray.every(bool => bool);
      },
    };
  }, [provider]);

  const addressValidationTest = useMemo(() => {
    return {
      test: async (inputValue: string | undefined) => {
        if (!inputValue) return false;
        addressValidationMap.current.clear();
        if (!!inputValue && inputValue.trim() && inputValue.endsWith('.eth')) {
          const resolvedAddress = await provider.resolveName(inputValue).catch();
          if (resolvedAddress) {
            addressValidationMap.current.set(inputValue, {
              address: resolvedAddress,
              index: 0,
              isValidAddress: true,
              errorMessage: null,
            });
            return true;
          } else {
            addressValidationMap.current.set(inputValue, {
              address: '',
              index: 0,
              isValidAddress: false,
              errorMessage: 'Invalid ENS Address',
            });
            return false;
          }
        }

        const isValidAddress = utils.isAddress(inputValue);
        if (isValidAddress) {
          addressValidationMap.current.set(inputValue, {
            address: inputValue,
            index: 0,
            isValidAddress: true,
            errorMessage: null,
          });
        } else {
          addressValidationMap.current.set(inputValue, {
            address: '',
            index: 0,
            isValidAddress: false,
            errorMessage: 'Invalid Address',
          });
        }
      },
    };
  }, [provider]);

  return { addressArrValidationTest, addressValidationTest, addressValidationMap };
};
