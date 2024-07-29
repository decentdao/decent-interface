import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { SablierPayment, RoleValue, RoleFormValues } from '../../../components/pages/Roles/types';
import { useValidationAddress } from '../common/useValidationAddress';

export const useRolesSchema = () => {
  const { t } = useTranslation(['roles']);
  const { addressValidationTest } = useValidationAddress();

  const bigIntValidationSchema = Yup.object()
    .shape({
      value: Yup.string(),
      bigintValue: Yup.mixed().nullable(),
      // @todo - add validation for balance bigger than entered amount
      // It's problematic at the moment due to how streams are passed into Zustand store
    })
    .required();

  const assetValidationSchema = Yup.object().shape({
    address: Yup.string(),
    symbol: Yup.string(),
    decimals: Yup.number(),
  });

  const rolesSchema = useMemo(
    () =>
      Yup.object<RoleFormValues>().shape({
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
                payments: Yup.array().of(
                  Yup.object()
                    .default(undefined)
                    .nullable()
                    .when({
                      is: (payment: SablierPayment) => payment !== undefined,
                      then: _vestingSchema =>
                        _vestingSchema
                          .shape({
                            asset: assetValidationSchema,
                            amount: bigIntValidationSchema,
                            scheduleType: Yup.string()
                              .oneOf(['duration', 'fixedDate'])
                              .required()
                              .default('duration'),

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
                                name: 'valid-payment-schedule',
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
                                (scheduleDuration.vestingDuration ||
                                  scheduleDuration.cliffDuration);

                              const hasFixedDate =
                                scheduleFixedDate &&
                                (scheduleFixedDate.startDate || scheduleFixedDate.endDate);

                              return !!hasDuration || !!hasFixedDate;
                            },
                          }),
                    }),
                ),
              }),
          }),
      }),
    [addressValidationTest, assetValidationSchema, bigIntValidationSchema, t],
  );
  return { rolesSchema };
};
