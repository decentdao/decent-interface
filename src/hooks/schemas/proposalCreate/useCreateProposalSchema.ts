import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { encodeFunction } from '../../../utils/crypto';
import { useValidationAddress } from '../common/useValidationAddress';

/**
 * validation schema for Create Proposal workflow
 * @dev https://www.npmjs.com/package/yup
 */
export const useCreateProposalSchema = () => {
  const { addressValidationTest } = useValidationAddress();

  const { t } = useTranslation('proposal');

  const createProposalValidation = useMemo(
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
              functionName: Yup.string().matches(/^[a-z0-9]+$/i, {
                message: t('functionNameError'),
              }),
              functionSignature: Yup.string(),
              parameters: Yup.string(),
              encodedFunctionData: Yup.string().test({
                message: t('errorInvalidFragments'),
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
        proposalMetadata: Yup.object().shape({
          title: Yup.string().notRequired(),
          description: Yup.string().notRequired(),
          documentationUrl: Yup.string()
            .notRequired()
            .when({
              is: (value?: string) => !!value,
              then: schema =>
                schema.test({
                  message: t('Invalid URL'),
                  test: value => {
                    try {
                      return Boolean(new URL(value || ''));
                    } catch (e) {
                      return false;
                    }
                  },
                }),
            }),
        }),
        nonce: Yup.number(),
      }),
    [addressValidationTest, t]
  );
  return { createProposalValidation };
};
