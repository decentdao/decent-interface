import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { encodeFunction } from '../../../utils/crypto';
import { useValidationAddress } from '../common/useValidationAddress';

/**
 * validation schema for Create Integration workflow
 * @dev https://www.npmjs.com/package/yup
 */
export const useCreateIntegrationSchema = () => {
  const { addressValidationTest } = useValidationAddress();

  const { t } = useTranslation(['createIntegration', 'proposal']);

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
              functionSignature: Yup.string(),
              parameters: Yup.string(),
              encodedFunctionData: Yup.string().test({
                message: t('errorInvalidFragments', { ns: 'proposal' }),
                test: (_, context) => {
                  const functionName = context.parent.functionName;
                  const functionSignature = context.parent.functionSignature;
                  const parameters = context.parent.parameters;
                  if (!functionName) return false;
                  const encodedFunction = encodeFunction(
                    functionName,
                    functionSignature,
                    parameters
                  );
                  return !!encodedFunction;
                },
              }),
            })
          ),
        integrationMetadata: Yup.object().shape({
          title: Yup.string().required(),
          description: Yup.string().notRequired(),
        }),
      }),
    [addressValidationTest, t]
  );
  return { createIntegrationValidation };
};
