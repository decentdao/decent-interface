import { utils } from 'ethers';
import { useMemo, useRef } from 'react';
import { useProvider } from 'wagmi';

export const useValidationAddress = () => {
  const provider = useProvider();
  const inputValidation = useRef<
    Map<
      string,
      { address: string; index: number; errorMessage: string | null; isValidAddress: boolean }
    >
  >(new Map());

  const addressArrValidationTest = useMemo(() => {
    return {
      test: async (addressArr: string[] | undefined) => {
        if (!addressArr || !addressArr.length) return false;
        const validationArray = await Promise.all(
          addressArr.map(async (inputValue, index) => {
            if (!!inputValue && inputValue.trim() && inputValue.endsWith('.eth')) {
              const resolvedAddress = await provider.resolveName(inputValue).catch();
              if (resolvedAddress) {
                inputValidation.current.set(inputValue, {
                  address: resolvedAddress,
                  index,
                  isValidAddress: true,
                  errorMessage: null,
                });
                return true;
              } else {
                inputValidation.current.set(inputValue, {
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
              inputValidation.current.set(inputValue, {
                address: inputValue,
                index,
                isValidAddress: true,
                errorMessage: null,
              });
              return true;
            } else {
              inputValidation.current.set(inputValue, {
                address: inputValue,
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
        if (!!inputValue && inputValue.trim() && inputValue.endsWith('.eth')) {
          const resolvedAddress = await provider.resolveName(inputValue).catch();
          if (resolvedAddress) {
            inputValidation.current.set(inputValue, {
              address: resolvedAddress,
              index: 0,
              isValidAddress: true,
              errorMessage: null,
            });
            return true;
          } else {
            inputValidation.current.set(inputValue, {
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
          inputValidation.current.set(inputValue, {
            address: inputValue,
            index: 0,
            isValidAddress: true,
            errorMessage: null,
          });
        }
      },
    };
  }, [provider]);

  return { addressArrValidationTest, addressValidationTest, inputValidation };
};
