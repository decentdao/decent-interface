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
            .ensure()
            .of(Yup.string().test(addressValidationTest))
            .when({
              is: (array: string[]) => array && array.length > 1,
              then: Yup.array().of(Yup.string().test(uniqueAddressValidationTest)),
            }),
          signatureThreshold: Yup.number().min(1).required(),
          numOfSigners: Yup.number().min(1),
        }),
      }),
    [addressValidationTest, uniqueAddressValidationTest]
  );
  return { createDAOValidation };
};
