import { Box, FormControl } from '@chakra-ui/react';
import { Field, FieldProps } from 'formik';
import { useTranslation } from 'react-i18next';
import { CARD_SHADOW } from '../../../../constants/common';
import { AddressInput } from '../../../ui/forms/EthAddressInput';
import { InputComponent, TextareaComponent } from '../../../ui/forms/InputComponent';
import LabelWrapper from '../../../ui/forms/LabelWrapper';
import { RoleFormValues } from '../types';

export default function RoleFormInfo() {
  const { t } = useTranslation('roles');

  return (
    <Box
      px={{ base: '1rem', md: 0 }}
      py="1rem"
      bg="neutral-2"
      boxShadow={{
        base: CARD_SHADOW,
        md: 'unset',
      }}
      borderRadius="0.5rem"
    >
      <FormControl>
        <Field name={`roleEditing.name`}>
          {({
            field,
            form: { setFieldValue, setFieldTouched },
            meta,
          }: FieldProps<string, RoleFormValues>) => (
            <LabelWrapper
              label={t('roleName')}
              errorMessage={meta.touched && meta.error ? meta.error : undefined}
            >
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
              />
            </LabelWrapper>
          )}
        </Field>
      </FormControl>
      <FormControl>
        <Field name={`roleEditing.description`}>
          {({
            field,
            form: { setFieldValue, setFieldTouched },
            meta,
          }: FieldProps<string, RoleFormValues>) => (
            <LabelWrapper
              label={t('description')}
              errorMessage={meta.touched && meta.error ? meta.error : undefined}
            >
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
              />
            </LabelWrapper>
          )}
        </Field>
      </FormControl>
      <FormControl>
        <Field name={`roleEditing.wearer`}>
          {({
            field,
            form: { setFieldValue, setFieldTouched },
            meta,
          }: FieldProps<string, RoleFormValues>) => (
            <LabelWrapper
              label={t('member')}
              errorMessage={meta.touched && meta.error ? meta.error : undefined}
            >
              <AddressInput
                value={field.value}
                onBlur={() => {
                  setFieldTouched(field.name, true);
                }}
                onChange={e => {
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
