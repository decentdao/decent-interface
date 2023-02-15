import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { DAOEssentials } from '../../../components/DaoCreator/types';
import { useValidationAddress } from '../common/useValidationAddress';
import { GovernanceTypes } from './../../../providers/Fractal/governance/types';
import { useDAOCreateTests } from './useDAOCreateTests';

/**
 * validation schema for DAO Create workflow
 * @dev https://www.npmjs.com/package/yup
 */
export const useDAOCreateSchema = ({ isSubDAO }: { isSubDAO?: boolean }) => {
  const { addressValidationTest, uniqueAddressValidationTest } = useValidationAddress();
  const { maxAllocationValidation, allocationValidationTest, uniqueAllocationValidationTest } =
    useDAOCreateTests();

  const { t } = useTranslation(['daoCreate']);

  const createDAOValidation = useMemo(
    () =>
      Yup.object().shape({
        essentials: Yup.object().shape({
          daoName: Yup.string().required(),
          governance: Yup.string().required(),
        }),
        gnosis: Yup.object().when('essentials', {
          is: ({ governance }: DAOEssentials) => governance === GovernanceTypes.GNOSIS_SAFE,
          then: _schema =>
            _schema.shape({
              trustedAddresses: Yup.array()
                .min(1)
                .when({
                  is: (array: string[]) => array && array.length > 1,
                  then: schema =>
                    schema.of(
                      Yup.string().test(addressValidationTest).test(uniqueAddressValidationTest)
                    ),
                  otherwise: schema => schema.of(Yup.string().test(addressValidationTest)),
                }),
              signatureThreshold: Yup.number()
                .min(1, t('errorLowSignerThreshold'))
                .max(Yup.ref('numOfSigners'), t('errorHighSignerThreshold'))
                .required(),
              numOfSigners: Yup.number().min(1),
            }),
        }),
        govToken: Yup.object().when('essentials', {
          is: ({ governance }: DAOEssentials) => governance === GovernanceTypes.GNOSIS_SAFE_USUL,
          then: _schema =>
            _schema.shape({
              tokenName: Yup.string().required(),
              tokenSymbol: Yup.string().required().max(5, 'Limited to 5 chars'),
              tokenSupply: Yup.object().shape({ value: Yup.string().required() }),
              parentAllocationAmount: Yup.object().notRequired().shape({ value: Yup.string() }),
              tokenAllocations: Yup.array()
                .min(1)
                .of(
                  Yup.object().shape({
                    address: Yup.string()
                      .test(allocationValidationTest)
                      .test(uniqueAllocationValidationTest),
                    amount: Yup.object()
                      .required()
                      .shape({
                        value: Yup.string().test(maxAllocationValidation),
                      }),
                  })
                ),
            }),
        }),
        govModule: Yup.object().when('essentials', {
          is: ({ governance }: DAOEssentials) => governance === GovernanceTypes.GNOSIS_SAFE_USUL,
          then: _schema =>
            _schema.shape({
              quorumPercentage: Yup.object().shape({ value: Yup.string().required() }),
              timelock: Yup.object().shape({ value: Yup.string().required() }),
              votingPeriod: Yup.object().shape({ value: Yup.string().required() }),
            }),
        }),
        vetoGuard: Yup.object().when({
          is: isSubDAO,
          then: _schema =>
            _schema.shape({
              executionPeriod: Yup.object().shape({ value: Yup.string().required() }),
              timelockPeriod: Yup.object().shape({ value: Yup.string().required() }),
              vetoVotesThreshold: Yup.object().shape({ value: Yup.string().required() }),
              freezeVotesThreshold: Yup.object().shape({ value: Yup.string().required() }),
              freezeProposalPeriod: Yup.object().shape({ value: Yup.string().required() }),
              freezePeriod: Yup.object().shape({ value: Yup.string().required() }),
            }),
        }),
        // @todo add funding validation
        funding: Yup.object().shape({}),
      }),
    [
      t,
      addressValidationTest,
      uniqueAddressValidationTest,
      maxAllocationValidation,
      allocationValidationTest,
      uniqueAllocationValidationTest,
      isSubDAO,
    ]
  );
  return { createDAOValidation };
};
