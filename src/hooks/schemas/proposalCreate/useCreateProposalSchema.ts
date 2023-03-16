import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { useValidationAddress } from '../common/useValidationAddress';

/**
 * validation schema for Create Proposal workflow
 * @dev https://www.npmjs.com/package/yup
 */
export const useCreateProposalSchema = () => {
  const { addressValidationTest } = useValidationAddress();

  const { t } = useTranslation(['createProposal']);

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
              functionName: Yup.string(),
              // @add function error handling
              functionSignature: Yup.string(),
              parameters: Yup.string(),
              // @todo use Yup to update this value
              encodedFunctionData: Yup.string(),
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
