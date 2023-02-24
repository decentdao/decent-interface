import { useMemo } from 'react';
import * as Yup from 'yup';
import { useValidationAddress } from '../common/useValidationAddress';

/**
 * validation schema for Create Proposal workflow
 * @dev https://www.npmjs.com/package/yup
 */
export const useCreateProposalSchema = () => {
  const { addressValidationTest } = useValidationAddress();

  // const { t } = useTranslation(['createProposal']);

  const createDAOValidation = useMemo(
    () =>
      Yup.object().shape({
        proposalDescription: Yup.string(),
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
              isExpanded: Yup.boolean(),
              // @todo use Yup to update this value
              encodedFunctionData: Yup.string(),
            })
          ),
        proposalData: Yup.object().shape({
          title: Yup.string(),
          description: Yup.string(),
          documentationUrul: Yup.string(),
        }),
        nonce: Yup.number(),
      }),
    [addressValidationTest]
  );
  return { createDAOValidation };
};
