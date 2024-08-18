import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { SablierPayment, RoleValue, RoleFormValues } from '../../../components/pages/Roles/types';
import { useFractal } from '../../../providers/App/AppProvider';
import { useValidationAddress } from '../common/useValidationAddress';

export const useRolesSchema = () => {
  const { t } = useTranslation(['roles']);
  const {
    treasury: { assetsFungible },
  } = useFractal();
  const { addressValidationTest } = useValidationAddress();

  const bigIntValidationSchema = Yup.object().shape({
    value: Yup.string().required(t('roleInfoErrorPaymentAmountRequired')),
    bigintValue: Yup.mixed<bigint>()
      .nullable()
      .test({
        name: 'bigInt',
        message: t('roleInfoErrorPaymentInvalidAmount'),
        test: (value, cxt) => {
          if (!value || !cxt.from) return false;
          // @dev finds the parent asset address from the formik context `from` array
          const parentAssetAddress: string | undefined = cxt.from[1].value.asset.address;
          if (!parentAssetAddress) return false;
          const asset = assetsFungible.find(_asset => _asset.tokenAddress === parentAssetAddress);
          if (!asset) return false;

          return !isNaN(Number(value)) && value >= 0 && value <= BigInt(asset.balance);
        },
      }),
  });

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
