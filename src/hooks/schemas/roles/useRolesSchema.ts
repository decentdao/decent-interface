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
                      _vestingSchema
                        .shape({
                          asset: assetValidationSchema,
                          amount: bigIntValidationSchema,

                          // If duration tab is selected and its form has a value, then validate it:
                          // duration and cliff should both have years, days, and hours
                          scheduleDuration: Yup.object()
                            .default(undefined)
                            .nullable()
                            .shape({
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
                            })
                            .test({
                              name: 'valid-vesting-schedule',
                              message: t('roleInfoErrorVestingScheduleInvalid'),
                              test: _scheduleDuration => {
                                if (!_scheduleDuration) return true;

                                const { vestingDuration, cliffDuration } = _scheduleDuration;

                                const hasDuration =
                                  _scheduleDuration &&
                                  (_scheduleDuration.vestingDuration ||
                                    _scheduleDuration.cliffDuration);

                                if (hasDuration) {
                                  return (
                                    (vestingDuration.years > 0 ||
                                      vestingDuration.days > 0 ||
                                      vestingDuration.hours > 0) &&
                                    (cliffDuration.years > 0 ||
                                      cliffDuration.days > 0 ||
                                      cliffDuration.hours > 0)
                                  );
                                }
                              },
                            }),

                          // If fixed date tab is selected and its form has a value, then validate it:
                          // fixed date should have a start date and an end date
                          scheduleFixedDate: Yup.object()
                            .default(undefined)
                            .nullable()
                            .shape({
                              startDate: Yup.date().required(
                                t('roleInfoErrorVestingFixedDateStartDateRequired'),
                              ),
                              endDate: Yup.date().required(
                                t('roleInfoErrorVestingFixedDateEndDateRequired'),
                              ),
                            })
                            .test({
                              name: 'end-date-after-start-date',
                              message: t('roleInfoErrorVestingFixedDateEndDateAfterStartDate'),
                              test: _scheduleFixedDate => {
                                if (!_scheduleFixedDate) return true;

                                const { startDate, endDate } = _scheduleFixedDate;
                                return endDate > startDate;
                              },
                            }),
                        })
                        .test({
                          name: 'either-duration-or-fixed-date-required',
                          message: t('roleInfoErrorVestingScheduleOrFixedDateRequired'),
                          test: vestingFormValue => {
                            if (!vestingFormValue) return true;

                            const { scheduleDuration, scheduleFixedDate } = vestingFormValue;

                            const hasDuration =
                              scheduleDuration &&
                              (scheduleDuration.vestingDuration || scheduleDuration.cliffDuration);

                            const hasFixedDate =
                              scheduleFixedDate &&
                              (scheduleFixedDate.startDate || scheduleFixedDate.endDate);

                            return !!hasDuration || !!hasFixedDate;
                          },
                        }),
                  }),
              }),
          }),
      }),
    [addressValidationTest, assetValidationSchema, bigIntValidationSchema, t],
  );
  return { rolesSchema };
};
