import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getAddress } from 'viem';
import * as Yup from 'yup';
import {
  RoleFormValues,
  RoleHatFormValue,
  SablierPayment,
  SablierPaymentFormValues,
} from '../../../components/pages/Roles/types';
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
        name: 'Invalid amount',
        message: t('roleInfoErrorPaymentInvalidAmount'),
        test: (value, cxt) => {
          if (!value || !cxt.from) return false;
          // @dev finds the parent asset address from the formik context `from` array
          const [, { value: currentPayment }, { value: currentRoleHat }, { value: formContext }] =
            cxt.from;
          const parentAssetAddress = currentPayment.asset?.address;

          const currentPaymentIndex = currentRoleHat.roleEditingPaymentIndex;
          // get all current role's payments excluding this one.
          const allCurrentRolePayments: SablierPaymentFormValues[] = (
            currentRoleHat.payments ?? []
          ).filter(
            (_payment: SablierPaymentFormValues, index: number) =>
              index !== currentPaymentIndex && !_payment.streamId,
          );
          const allHatPayments: SablierPaymentFormValues[] = formContext.hats
            .filter((hat: RoleHatFormValue) => hat.id === currentRoleHat.id)
            .map((hat: RoleHatFormValue) => hat.payments ?? [])
            .flat();

          const totalPendingAmounts = [
            ...allHatPayments.filter(payment => !payment.streamId),
            ...allCurrentRolePayments,
          ].reduce((prev, curr) => (curr.amount?.bigintValue ?? 0n) + prev, 0n);

          if (!parentAssetAddress) return false;
          const asset = assetsFungible.find(
            _asset => getAddress(_asset.tokenAddress) === getAddress(parentAssetAddress),
          );
          if (!asset) return false;

          return value >= 0n && value <= BigInt(asset.balance) - totalPendingAmounts;
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
                            cliffDate: Yup.date().nullable().default(undefined),
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
                          })
                          .test({
                            name: 'cliff-date-before-end-date',
                            message: t(
                              'roleInfoErrorPaymentFixedDateCliffDateBetweenStartAndEndDate',
                            ),
                            test: _payments => {
                              if (!_payments) return false;
                              const { cliffDate, startDate, endDate } = _payments;
                              if (!cliffDate) return true;
                              return cliffDate > startDate && cliffDate < endDate;
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
