import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { useDaoInfoStore } from '../../../store/daoInfo/useDaoInfoStore';
import { useValidationAddress } from '../common/useValidationAddress';

/**
 * validation schema for Create Proposal workflow
 * @dev https://www.npmjs.com/package/yup
 */
const useCreateProposalSchema = () => {
  const { t } = useTranslation('proposal');
  const { addressValidationTest } = useValidationAddress();
  const { safe } = useDaoInfoStore();

  const labelOrValueValidationTest: Yup.TestFunction<string | undefined, Yup.AnyObject> = (
    _,
    context,
  ) => {
    if (!context.parent.signature) {
      return true;
    }

    if (!!context.parent.label || !!context.parent.value) {
      return true;
    }

    return false;
  };

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
              parameters: Yup.array().of(
                Yup.object().shape({
                  signature: Yup.string(),
                  label: Yup.string().test({
                    message: t('labelOrValueRequired'),
                    test: labelOrValueValidationTest,
                  }),
                  value: Yup.string().test({
                    message: t('labelOrValueRequired'),
                    test: labelOrValueValidationTest,
                  }),
                }),
              ),
            }),
          ),
        proposalMetadata: Yup.object().shape({
          title: Yup.string().trim().required().max(50),
          description: Yup.string().trim().notRequired(),
          documentationUrl: Yup.string().trim().notRequired(),
        }),
        nonce: Yup.number()
          .required()
          .moreThan((!!safe && safe.nonce - 1) || 0),
      }),
    [addressValidationTest, t, safe],
  );
  return { createProposalValidation };
};

export default useCreateProposalSchema;
