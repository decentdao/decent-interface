import { BigNumber } from 'ethers';
import { useMemo } from 'react';
import * as Yup from 'yup';
import { useValidationAddress } from '../common/useValidationAddress';
import { TokenAllocation } from './../../../types/tokenAllocation';
import { useDAOCreateTests } from './useDAOCreateTests';

/**
 * validation schema for DAO Create workflow
 * @dev https://www.npmjs.com/package/yup
 */
export const useDAOCreateSchema = () => {
  const { addressValidationTest, uniqueAddressValidationTest } = useValidationAddress();
  const { maxAllocationValidation, allocationValidationTest, uniqueAllocationValidationTest } =
    useDAOCreateTests();
  const createDAOValidation = useMemo(
    () =>
      Yup.object().shape({
        essentials: Yup.object().shape({
          daoName: Yup.string().required(),
          governance: Yup.string().required(),
        }),
        gnosis: Yup.object().shape({
          trustedAddresses: Yup.array()
            .min(1)
            .of(Yup.string().test(addressValidationTest))
            .when({
              is: (array: string[]) => array && array.length > 1,
              then: schema => schema.of(Yup.string().test(uniqueAddressValidationTest)),
            }),
          signatureThreshold: Yup.number().min(1).required(),
          numOfSigners: Yup.number().min(1),
        }),
        govToken: Yup.object().shape({
          tokenName: Yup.string().required(),
          tokenSupply: Yup.string().required(),
          tokenSymbol: Yup.string().required().max(5, 'Limited to 5 chars'),
          parentAllocationAmount: Yup.string().notRequired(),
          tokenAllocations: Yup.array()
            .min(1)
            .of(
              Yup.object().shape({
                address: Yup.string()
                  .test(allocationValidationTest)
                  .test(uniqueAllocationValidationTest),
                amount: Yup.string().required().test(maxAllocationValidation),
              })
            ),
        }),
        govModule: Yup.object().shape({
          quorumPercentage: Yup.string().required(),
          timelock: Yup.string().required(),
          votingPeriod: Yup.string().required(),
        }),
        vetoGuard: Yup.object().shape({
          executionPeriod: Yup.string().required(),
          timelockPeriod: Yup.string().required(),
          vetoVotesThreshold: Yup.string().required(),
          freezeVotesThreshold: Yup.string().required(),
          freezeProposalPeriod: Yup.string().required(),
          freezePeriod: Yup.string().required(),
        }),
        // @todo add funding validation
        funding: Yup.object().shape({}),
      }),
    [
      addressValidationTest,
      uniqueAddressValidationTest,
      maxAllocationValidation,
      allocationValidationTest,
      uniqueAllocationValidationTest,
    ]
  );
  return { createDAOValidation };
};
