import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { useValidationAddress } from '../common/useValidationAddress';

/**
 * validation schema for Create Proposal Template workflow
 * @dev https://www.npmjs.com/package/yup
 */
const useCreateProposalTemplateSchema = () => {
  const { t } = useTranslation('proposal');
  const { addressValidationTest } = useValidationAddress();

  const createProposalTemplateValidation = useMemo(
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
              parameters: Yup.array().of(
                Yup.object().shape({
                  signature: Yup.string().required(),
                  label: Yup.string(),
                  value: Yup.string(),
                })
              ),
            })
          ),
        proposalTemplateMetadata: Yup.object().shape({
          title: Yup.string().trim().required().max(50),
          description: Yup.string().trim().notRequired().max(300),
        }),
      }),
    [addressValidationTest, t]
  );
  return { createProposalTemplateValidation };
};

export default useCreateProposalTemplateSchema;
