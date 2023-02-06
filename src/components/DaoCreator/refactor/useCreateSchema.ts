import { useMemo } from 'react';
import * as Yup from 'yup';
import { useValidationAddress } from './useValidationAddress';

export const useCreateSchema = () => {
  const { addressArrValidationTest, addressValidationMap } = useValidationAddress();

  const createDAOValidation = useMemo(
    () =>
      Yup.object().shape({
        essentials: Yup.object().shape({
          daoName: Yup.string().required().min(1),
          governance: Yup.string().required(),
        }),
        gnosis: Yup.object().shape({
          // @todo add test for add least one valid address
          // @todo add test for all addresses must be valid
          trustedAddresses: Yup.array().required().test(addressArrValidationTest),
          signatureThreshold: Yup.number().min(1).required(),
          numOfSigners: Yup.number().min(1),
        }),
      }),
    [addressArrValidationTest]
  );
  return { createDAOValidation, addressValidationMap };
};
