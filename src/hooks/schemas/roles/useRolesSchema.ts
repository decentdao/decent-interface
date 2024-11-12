import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getAddress } from 'viem';
import * as Yup from 'yup';
import { useFractal } from '../../../providers/App/AppProvider';
import {
  RoleFormValues,
  RoleHatFormValue,
  SablierPayment,
  SablierPaymentFormValues,
} from '../../../types/roles';
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

  const paymentsSchema = useMemo(
    () =>
      Yup.array().of(
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
                  endDate: Yup.date().required(t('roleInfoErrorPaymentFixedDateEndDateRequired')),
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
                  message: t('roleInfoErrorPaymentFixedDateCliffDateBetweenStartAndEndDate'),
                  test: _payments => {
                    if (!_payments) return false;
                    const { cliffDate, startDate, endDate } = _payments;
                    if (!cliffDate) return true;
                    return cliffDate > startDate && cliffDate < endDate;
                  },
                }),
          }),
      ),
    [assetValidationSchema, bigIntValidationSchema, t],
  );

  const rolesSchema = useMemo(
    () =>
      Yup.object<RoleFormValues>().shape({
        roleEditing: Yup.object()
          .default(undefined)
          .nullable()
          .when({
            is: (roleEditing: RoleHatFormValue) => roleEditing !== undefined,
            then: _roleEditingSchema =>
              _roleEditingSchema.when('roleEditing.isTermed', {
                is: (isTermed: boolean) => isTermed,
                then: _schema =>
                  _schema.shape({
                    name: Yup.string().required(t('roleInfoErrorNameRequired')),
                    description: Yup.string().required(t('roleInfoErrorDescriptionRequired')),
                    payments: paymentsSchema,
                    canCreateProposals: Yup.boolean(),
                  }),
                otherwise: _schema =>
                  _schema.shape({
                    name: Yup.string().required(t('roleInfoErrorNameRequired')),
                    description: Yup.string().required(t('roleInfoErrorDescriptionRequired')),
                    wearer: Yup.string()
                      .required(t('roleInfoErrorMemberRequired'))
                      .test(addressValidationTest),
                    payments: paymentsSchema,
                    canCreateProposals: Yup.boolean(),
                  }),
              }),
          }),
        newRoleTerm: Yup.object()
          .default(undefined)
          .nullable()
          .when({
            is: (value: any) => value !== undefined,
            then: _schema =>
              _schema.shape({
                nominee: Yup.string()
                  .required(t('roleInfoErrorMemberRequired'))
                  .test(addressValidationTest),
                termEndDate: Yup.date()
                  .required('roleInfoErrorTermEndDateRequired')
                  .test({
                    name: 'term-end-date-after-now',
                    message: t('roleInfoErrorTermEndDateInvalid'),
                    test: (termEndDate, cxt) => {
                      if (!termEndDate || !cxt.from) return true;
                      const [, { value: roleForm }] = cxt.from;
                      const { roleTerms } = roleForm.roleEditing;
                      // remove the last element from terms and create a new array with the rest of the elements
                      if (!roleTerms || roleTerms.length === 0) return termEndDate > new Date();
                      const previousTerms = roleTerms.slice(0, -1);

                      if (
                        !previousTerms.every(
                          (term: { termEndDate: Date }) =>
                            term.termEndDate.getTime() < termEndDate.getTime(),
                        )
                      ) {
                        return true;
                      }
                      return termEndDate > new Date();
                    },
                  }),
              }),
          }),
      }),
    [addressValidationTest, paymentsSchema, t],
  );
  return { rolesSchema };
};
