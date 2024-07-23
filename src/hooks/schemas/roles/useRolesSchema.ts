import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { RoleValue } from '../../../components/pages/Roles/types';
import { useValidationAddress } from '../common/useValidationAddress';

export const useRolesSchema = () => {
  const { addressValidationTest } = useValidationAddress();
  const { t } = useTranslation(['roles']);

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
                name: Yup.string().required(t('roleNameRequired')),
                description: Yup.string().required(t('roleDescriptionRequired')),
                wearer: Yup.string().required(t('roleMemberRequired')).test(addressValidationTest),
              }),
          }),
      }),
    [addressValidationTest, t],
  );
  return { rolesSchema };
};
