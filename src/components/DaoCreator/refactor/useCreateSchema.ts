import { useMemo } from 'react';
import * as Yup from 'yup';
import { useValidationAddress } from './useValidationAddress';

export const useCreateSchema = () => {
  const { addressValidationTest, uniqueAddressValidationTest } = useValidationAddress();

  const createDAOValidation = useMemo(
    () =>
      Yup.object().shape({
        essentials: Yup.object().shape({
          daoName: Yup.string().required().min(1),
          governance: Yup.string().required(),
        }),
        gnosis: Yup.object().shape({
          trustedAddresses: Yup.array()
            .min(1)
            .of(Yup.string().test(addressValidationTest))
            .when({
              is: (array: string[]) => array && array.length > 1,
              then: Yup.array().of(Yup.string().test(uniqueAddressValidationTest)),
            }),
          signatureThreshold: Yup.number().min(1).required(),
          numOfSigners: Yup.number().min(1),
        }),
        govToken: Yup.object().shape({
          tokenName: Yup.string().required(),
          tokenSupply: Yup.number(),
          tokenSymbol: Yup.string().max(5, 'Limited to 5 chars'),
          parentAllocationAmount: Yup.number()
            .notRequired()
            .test({
              name: 'manage parent token amount',
              message: 'incorrect',
              test: function (value, context) {
                return false;
              },
            }),
          tokenAllocations: Yup.array().of(
            Yup.object()
              .shape({
                address: Yup.string().test(addressValidationTest),
                amount: Yup.number().test({
                  name: 'manage token amount',
                  message: 'incorrect',
                  test: function (value, context) {
                    return false;
                  },
                }),
              })
              .when({
                is: (array: string[]) => array && array.length > 1,
                then: Yup.array().of(
                  Yup.object().shape({ address: Yup.string().test(uniqueAddressValidationTest) })
                ),
              })
          ),
        }),
      }),
    [addressValidationTest, uniqueAddressValidationTest]
  );
  return { createDAOValidation };
};
