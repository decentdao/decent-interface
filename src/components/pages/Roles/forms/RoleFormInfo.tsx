import { Box, FormControl } from '@chakra-ui/react';
import { Field, FieldProps, useFormikContext } from 'formik';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DETAILS_BOX_SHADOW } from '../../../../constants/common';
import useAddress from '../../../../hooks/utils/useAddress';
import { AddressInput } from '../../../ui/forms/EthAddressInput';
import { InputComponent, TextareaComponent } from '../../../ui/forms/InputComponent';
import LabelWrapper from '../../../ui/forms/LabelWrapper';
import { RoleFormValues } from '../types';

export default function RoleFormInfo() {
  const { t } = useTranslation('roles');

  const [roleWearerString, setRoleWearerString] = useState<string>('');
  const { address: resolvedWearerAddress, isValid: isValidWearerAddress } =
    useAddress(roleWearerString);

  const { setFieldValue } = useFormikContext<RoleFormValues>();

  useEffect(() => {
    if (isValidWearerAddress) {
      setFieldValue('roleEditing.resolvedWearer', resolvedWearerAddress);
    }
  }, [isValidWearerAddress, resolvedWearerAddress, setFieldValue]);

  return (
    <Box
      px={{ base: '1rem', md: 0 }}
      py="1rem"
      bg="neutral-2"
      boxShadow={{
        base: DETAILS_BOX_SHADOW,
        md: 'unset',
      }}
      borderRadius="0.5rem"
      display="flex"
      flexDirection="column"
      gap="1rem"
    >
      <FormControl>
        <Field name="roleEditing.name">
          {({ field, form: { setFieldTouched }, meta }: FieldProps<string, RoleFormValues>) => (
            <InputComponent
              value={field.value}
              onChange={e => {
                setFieldValue(field.name, e.target.value);
              }}
              onBlur={() => {
                setFieldTouched(field.name, true);
              }}
              testId="role-name"
              placeholder={t('roleName')}
              isRequired
              gridContainerProps={{
                gridTemplateColumns: { base: '1fr', md: '1fr' },
              }}
              inputContainerProps={{
                p: 0,
              }}
              label={t('roleName')}
              errorMessage={meta.touched && meta.error ? meta.error : undefined}
            />
          )}
        </Field>
      </FormControl>
      <FormControl>
        <Field name="roleEditing.description">
          {({ field, form: { setFieldTouched }, meta }: FieldProps<string, RoleFormValues>) => (
            <TextareaComponent
              value={field.value}
              onChange={e => {
                setFieldValue(field.name, e.target.value);
              }}
              isRequired
              gridContainerProps={{
                gridTemplateColumns: { base: '1fr', md: '1fr' },
              }}
              inputContainerProps={{
                p: 0,
              }}
              textAreaProps={{
                h: '12rem',
                onBlur: () => {
                  setFieldTouched(field.name, true);
                },
              }}
              label={t('roleDescription')}
              errorMessage={meta.touched && meta.error ? meta.error : undefined}
            />
          )}
        </Field>
      </FormControl>
      <FormControl>
        <Field name="roleEditing.wearer">
          {({ field, form: { setFieldTouched }, meta }: FieldProps<string, RoleFormValues>) => (
            <LabelWrapper
              label={t('member')}
              errorMessage={meta.touched && meta.error ? meta.error : undefined}
              isRequired
              labelColor="neutral-7"
            >
              <AddressInput
                value={field.value}
                onBlur={() => {
                  setFieldTouched(field.name, true);
                }}
                onChange={e => {
                  const inputWearer = e.target.value;
                  setRoleWearerString(inputWearer);
                  setFieldValue(field.name, e.target.value);
                }}
              />
            </LabelWrapper>
          )}
        </Field>
      </FormControl>
    </Box>
  );
}
