import { useMemo } from 'react';
import * as Yup from 'yup';
import { RoleValue } from '../../../components/pages/Roles/types';
import { useValidationAddress } from '../common/useValidationAddress';

export const useRolesSchema = () => {
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
                name: Yup.string().required('Role name is required'),
                description: Yup.string().required('Role description is required'),
                wearer: Yup.string().required('Member is required').test(addressValidationTest),
                payroll: Yup.object()
                  .default(undefined)
                  .nullable()
                  .shape({
                    asset: Yup.object().shape({
                      address: Yup.string(),
                      name: Yup.string(),
                      symbol: Yup.string(),
                      decimals: Yup.number(),
                    }),
                    amount: Yup.object().shape({
                      value: Yup.string(),
                    }),
                    paymentFrequency: Yup.string(),
                    paymentStartData: Yup.date(),
                    paymentFrequencyNumber: Yup.number(),
                  }),
              }),
          }),
      }),
    [addressValidationTest],
  );
  return { rolesSchema };
};
