import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { DAOEssentials, StrategyType, BigNumberValuePair, TokenCreationType } from '../../../types';
import { useValidationAddress } from '../common/useValidationAddress';
import { useDAOCreateTests } from './useDAOCreateTests';

/**
 * validation schema for DAO Create workflow
 * @dev https://www.npmjs.com/package/yup
 */
export const useDAOCreateSchema = ({ isSubDAO }: { isSubDAO?: boolean }) => {
  const { addressValidationTestSimple, addressValidationTest, uniqueAddressValidationTest } =
    useValidationAddress();
  const {
    maxAllocationValidation,
    allocationValidationTest,
    uniqueAllocationValidationTest,
    validERC20Address,
  } = useDAOCreateTests();

  const { t } = useTranslation(['daoCreate']);

  const createDAOValidation = useMemo(
    () =>
      Yup.object().shape({
        essentials: Yup.object().shape({
          daoName: Yup.string().required(),
          governance: Yup.string().required(),
        }),
        gnosis: Yup.object().when('essentials', {
          is: ({ governance }: DAOEssentials) => governance === StrategyType.GNOSIS_SAFE,
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
                .required(t('errorHighSignerThreshold')),
              numOfSigners: Yup.number()
                .min(1, t('errorMinSigners'))
                .required(t('errorMinSigners')),
              customNonce: Yup.number(),
            }),
        }),
        govToken: Yup.object().when('essentials', {
          is: ({ governance }: DAOEssentials) => governance === StrategyType.GNOSIS_SAFE_AZORIUS,
          then: _schema =>
            _schema.shape({
              tokenName: Yup.string().when('tokenCreationType', {
                is: (value: TokenCreationType) => !!value && value === TokenCreationType.NEW,
                then: __schema => __schema.required(),
              }),
              tokenSymbol: Yup.string().when('tokenCreationType', {
                is: (value: TokenCreationType) => !!value && value === TokenCreationType.NEW,
                then: __schema => __schema.required(),
              }),
              tokenSupply: Yup.object().shape({
                value: Yup.string().when('tokenCreationType', {
                  is: (value: TokenCreationType) => !!value && value === TokenCreationType.NEW,
                  then: __schema => __schema.required(),
                }),
              }),
              tokenImportAddress: Yup.string().when('tokenCreationType', {
                is: (value: TokenCreationType) => !!value && value === TokenCreationType.IMPORTED,
                then: __schmema =>
                  __schmema.test(addressValidationTestSimple).test(validERC20Address),
              }),
              parentAllocationAmount: Yup.object().when({
                is: (value: BigNumberValuePair) => !!value.value,
                then: schema =>
                  schema.shape({
                    value: Yup.string().test(maxAllocationValidation),
                  }),
              }),
              tokenAllocations: Yup.array().when('tokenCreationType', {
                is: (value: TokenCreationType) => !!value && value === TokenCreationType.NEW,
                then: __schema =>
                  __schema.min(1).of(
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
        }),
        govModule: Yup.object().when('essentials', {
          is: ({ governance }: DAOEssentials) => governance === StrategyType.GNOSIS_SAFE_AZORIUS,
          then: _schema =>
            _schema.shape({
              quorumPercentage: Yup.object().shape({ value: Yup.string().required() }),
              timelock: Yup.object().shape({ value: Yup.string().required() }),
              votingPeriod: Yup.object().shape({ value: Yup.string().required() }),
            }),
        }),
        freezeGuard: Yup.object().when({
          is: isSubDAO,
          then: _schema =>
            _schema.shape({
              executionPeriod: Yup.object().shape({ value: Yup.string().required() }),
              timelockPeriod: Yup.object().shape({ value: Yup.string().required() }),
              freezeVotesThreshold: Yup.object().shape({ value: Yup.string().required() }),
              freezeProposalPeriod: Yup.object().shape({ value: Yup.string().required() }),
              freezePeriod: Yup.object().shape({ value: Yup.string().required() }),
            }),
        }),
      }),
    [
      t,
      addressValidationTest,
      uniqueAddressValidationTest,
      maxAllocationValidation,
      allocationValidationTest,
      uniqueAllocationValidationTest,
      isSubDAO,
      validERC20Address,
      addressValidationTestSimple,
    ]
  );
  return { createDAOValidation };
};
