import { useMemo } from 'react';
import * as Yup from 'yup';
import { useValidationAddress } from '../common/useValidationAddress';

/**
 * validation schema for Create Integration workflow
 * @dev https://www.npmjs.com/package/yup
 */
export const useCreateIntegrationSchema = () => {
  const { addressValidationTest } = useValidationAddress();

  const createIntegrationValidation = useMemo(
    () =>
      Yup.object().shape({
        transactions: Yup.array()
          .min(1)
          .of(
            Yup.object().shape({
              targetAddress: Yup.string().test(addressValidationTest),
              ethValue: Yup.object().shape({
                value: Yup.string(),
              }),
              functionName: Yup.string(),
              parameters: Yup.array().of(
                Yup.object().shape({
                  signature: Yup.string().required(),
                  label: Yup.string(),
                  value: Yup.string(),
                })
              ),
            })
          ),
        integrationMetadata: Yup.object().shape({
          title: Yup.string().required(),
          description: Yup.string().notRequired(),
        }),
      }),
    [addressValidationTest]
  );
  return { createIntegrationValidation };
};
