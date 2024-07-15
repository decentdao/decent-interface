import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { RoleValue } from '../../../components/pages/Roles/types';
import { useValidationAddress } from '../common/useValidationAddress';

export const useRolesSchema = () => {
  const { t } = useTranslation(['roles']);
  const { addressValidationTest } = useValidationAddress();
  const rolesSchema = useMemo(
    () =>
      Yup.object().shape({
        roleEditing: Yup.object()
          .default(undefined)
          .nullable()
          .when({
            is: (roleEditing: RoleValue) => roleEditing !== undefined,
            then: _schema =>
              _schema.shape({
                name: Yup.string().required(t('roleInfoErrorNameRequired')),
                description: Yup.string().required(t('roleInfoErrorDescriptionRequired')),
                wearer: Yup.string()
                  .required(t('roleInfoErrorMemberRequired'))
                  .test(addressValidationTest),
                payroll: Yup.object()
                  .default(undefined)
                  .nullable()
                  .shape({
                    asset: Yup.object().shape({
                      address: Yup.string(),
                      symbol: Yup.string(),
                      decimals: Yup.number(),
                      logo: Yup.string(),
                      balance: Yup.string(),
                    }),
                    amount: Yup.object()
                      .shape({
                        value: Yup.string().required(),
                        bigIntValue: Yup.mixed().nullable(),
                      })
                      .test({
                        name: 'isAmountValid',
                        message: t('roleInfoErrorAmountInvalid'),
                        test: (v, cxt) => {
                          const balance: string | undefined = cxt.parent.asset.balance;
                          if (balance === undefined || !v.bigIntValue) return false;
                          return (v.bigIntValue as bigint) > BigInt(balance);
                        },
                      }),
                    paymentFrequency: Yup.string(),
                    paymentStartData: Yup.date(),
                    paymentFrequencyNumber: Yup.number(),
                  }),
              }),
          }),
      }),
    [addressValidationTest, t],
  );
  return { rolesSchema };
};
