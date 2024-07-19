import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import {
  Frequency,
  SablierPayroll,
  RoleValue,
  RoleFormVestingValue,
} from '../../../components/pages/Roles/types';
import { useValidationAddress } from '../common/useValidationAddress';

export const useRolesSchema = () => {
  const { t } = useTranslation(['roles']);
  const { addressValidationTest } = useValidationAddress();

  const bigIntValidationSchema = Yup.object()
    .shape({
      value: Yup.string(),
      bigintValue: Yup.mixed().nullable(),
    })
    .required()
    .test({
      name: 'isAmountValid',
      message: t('roleInfoErrorAmountInvalid'),
      test: (v, cxt) => {
        const balance: string | undefined = cxt.parent.asset.balance;
        if (balance === undefined || v.bigintValue === undefined || !v.value === undefined) {
          return false;
        }

        return (v.bigintValue as bigint) <= BigInt(balance);
      },
    });

  const assetValidationSchema = Yup.object().shape({
    address: Yup.string(),
    symbol: Yup.string(),
    decimals: Yup.number(),
    balance: Yup.string(),
  });

  const rolesSchema = useMemo(
    () =>
      Yup.object().shape({
        roleEditing: Yup.object()
          .default(undefined)
          .nullable()
          .when({
            is: (roleEditing: RoleValue) => roleEditing !== undefined,
            then: _roleEditingSchema =>
              _roleEditingSchema.shape({
                name: Yup.string().required(t('roleInfoErrorNameRequired')),
                description: Yup.string().required(t('roleInfoErrorDescriptionRequired')),
                wearer: Yup.string()
                  .required(t('roleInfoErrorMemberRequired'))
                  .test(addressValidationTest),
                payroll: Yup.object()
                  .default(undefined)
                  .nullable()
                  .when({
                    is: (payroll: SablierPayroll) => payroll !== undefined,
                    then: _payrollSchema =>
                      _payrollSchema.shape({
                        asset: assetValidationSchema,
                        amount: bigIntValidationSchema,
                        paymentFrequency: Yup.string()
                          .oneOf([
                            Frequency.Monthly.toString(),
                            Frequency.EveryTwoWeeks.toString(),
                            Frequency.Weekly.toString(),
                          ])
                          .required(t('roleInfoErrorPaymentFrequencyRequired')),
                        paymentStartDate: Yup.date().required(
                          t('roleInfoErrorPaymentStartDateRequired'),
                        ),
                        paymentFrequencyNumber: Yup.number().required(
                          t('roleInfoErrorPaymentFrequencyNumberRequired'),
                        ),
                      }),
                  }),
                vesting: Yup.object()
                  .default(undefined)
                  .nullable()
                  .when({
                    is: (vesting: RoleFormVestingValue) => vesting !== undefined,
                    then: _vestingSchema =>
                      _vestingSchema.shape({
                        asset: assetValidationSchema,
                        amount: bigIntValidationSchema,

                        // If duration tab is selected and its form has a value, then validate it:
                        // duration and cliff should both have years, days, and hours
                        scheduleDuration: Yup.object()
                          .default(undefined)
                          .nullable()
                          .when({
                            is: (duration: any) => duration !== undefined,
                            then: _durationSchema =>
                              _durationSchema.shape({
                                vestingDuration: Yup.object().shape({
                                  years: Yup.number().required().default(0),
                                  days: Yup.number().required().default(0),
                                  hours: Yup.number().required().default(0),
                                }),
                                cliffDuration: Yup.object().shape({
                                  years: Yup.number().required().default(0),
                                  days: Yup.number().required().default(0),
                                  hours: Yup.number().required().default(0),
                                }),
                              }),
                          }),

                        // If fixed date tab is selected and its form has a value, then validate it:
                        // fixed date should have a start date and an end date
                        scheduleFixedDate: Yup.object()
                          .default(undefined)
                          .nullable()
                          .when({
                            is: (fixedDate: Date[]) => fixedDate !== undefined,
                            then: _fixedDateSchema =>
                              _fixedDateSchema.shape({
                                startDate: Yup.date().required(
                                  t('roleInfoErrorVestingFixedDateStartDateRequired'),
                                ),
                                endDate: Yup.date().required(
                                  t('roleInfoErrorVestingFixedDateEndDateRequired'),
                                ),
                              }),
                          }),
                      }),
                  }),
              }),
          }),
      }),
    [addressValidationTest, assetValidationSchema, bigIntValidationSchema, t],
  );
  return { rolesSchema };
};
