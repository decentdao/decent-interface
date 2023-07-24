import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import {
  DAOEssentials,
  BigNumberValuePair,
  TokenCreationType,
  GovernanceSelectionType,
} from '../../../types';
import { useValidationAddress } from '../common/useValidationAddress';
import { useDAOCreateTests } from './useDAOCreateTests';

/**
 * validation schema for DAO Create workflow
 * @dev https://www.npmjs.com/package/yup
 */
export const useDAOCreateSchema = ({ isSubDAO }: { isSubDAO?: boolean }) => {
  const {
    addressValidationTestSimple,
    addressValidationTest,
    uniqueAddressValidationTest,
    uniqueNFTAddressValidationTest,
    ensNameValidationTest,
  } = useValidationAddress();
  const {
    minValueValidation,
    maxAllocationValidation,
    allocationValidationTest,
    uniqueAllocationValidationTest,
    validERC20Address,
    validERC721Address,
    isBigNumberValidation,
  } = useDAOCreateTests();

  const { t } = useTranslation(['daoCreate']);

  const createDAOValidation = useMemo(
    () =>
      Yup.object().shape({
        essentials: Yup.object().shape({
          daoName: Yup.string().required(),
          governance: Yup.string().required(),
          snapshotURL: Yup.string().when({
            is: (value: string) => !!value,
            then: _schema => _schema.test(ensNameValidationTest),
          }),
        }),
        multisig: Yup.object().when('essentials', {
          is: ({ governance }: DAOEssentials) => governance === GovernanceSelectionType.MULTISIG,
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
        erc20Token: Yup.object().when('essentials', {
          is: ({ governance }: DAOEssentials) =>
            governance === GovernanceSelectionType.AZORIUS_ERC20,
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
                then: __schema =>
                  __schema.test(addressValidationTestSimple).test(validERC20Address),
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
        erc721Token: Yup.object().when('essentials', {
          is: ({ governance }: DAOEssentials) =>
            governance === GovernanceSelectionType.AZORIUS_ERC721,
          then: _schema =>
            _schema.shape({
              nfts: Yup.array()
                .min(1)
                .of(
                  Yup.object().shape({
                    tokenAddress: Yup.string()
                      .test(addressValidationTestSimple)
                      .test(uniqueNFTAddressValidationTest)
                      .test(validERC721Address),
                    tokenWeight: Yup.object()
                      .required()
                      .shape({
                        value: Yup.string().test(isBigNumberValidation).test(minValueValidation(1)), // Otherwise "0" treated as proper value
                      }),
                  })
                ),
            }),
        }),
        azorius: Yup.object().when('essentials', {
          is: ({ governance }: DAOEssentials) =>
            governance === GovernanceSelectionType.AZORIUS_ERC20 ||
            governance === GovernanceSelectionType.AZORIUS_ERC721,
          then: _schema =>
            _schema.shape({
              quorumPercentage: Yup.object().shape({ value: Yup.string().required() }),
              timelock: Yup.object().shape({ value: Yup.string().required() }),
              votingPeriod: Yup.object().shape({ value: Yup.string().required() }),
            }),
        }),
        freeze: Yup.object().when({
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
      ensNameValidationTest,
      isSubDAO,
      t,
      addressValidationTest,
      uniqueAddressValidationTest,
      addressValidationTestSimple,
      validERC20Address,
      validERC721Address,
      maxAllocationValidation,
      allocationValidationTest,
      uniqueAllocationValidationTest,
      uniqueNFTAddressValidationTest,
      minValueValidation,
      isBigNumberValidation,
    ]
  );
  return { createDAOValidation };
};
