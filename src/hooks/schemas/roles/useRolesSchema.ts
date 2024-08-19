import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { SablierPayment, RoleHatFormValue, RoleFormValues } from '../../../components/pages/Roles/types';
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
            is: (roleEditing: RoleHatFormValue) => roleEditing !== undefined,
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
                      then: _paymentSchema =>
                        _paymentSchema
                          .shape({
                            asset: assetValidationSchema,
                            amount: bigIntValidationSchema,
                            startDate: Yup.date().required(
                              t('roleInfoErrorPaymentFixedDateStartDateRequired'),
                            ),
                            endDate: Yup.date().required(
                              t('roleInfoErrorPaymentFixedDateEndDateRequired'),
                            ),
                          })
                          .test({
                            name: 'end-date-after-start-date',
                            message: t('roleInfoErrorPaymentFixedDateEndDateAfterStartDate'),
                            test: _payments => {
                              if (!_payments) return false;
                              const { startDate, endDate } = _payments;
                              return endDate > startDate;
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
