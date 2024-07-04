import { Box, FormControl } from '@chakra-ui/react';
import { Field, FieldProps } from 'formik';
import { CARD_SHADOW } from '../../../../constants/common';
import { AddressInput } from '../../../ui/forms/EthAddressInput';
import { InputComponent, TextareaComponent } from '../../../ui/forms/InputComponent';
import LabelWrapper from '../../../ui/forms/LabelWrapper';
import { RoleFormValues } from '../types';

export default function RoleFormInfo() {
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
              label="Role Name"
              errorMessage={meta.touched && meta.error ? meta.error : undefined}
            >
              <InputComponent
                value={field.value}
                onChange={e => {
                  setFieldTouched(field.name, true);
                  setFieldValue(field.name, e.target.value);
                }}
                testId="role-name"
                placeholder="Role Name"
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
              label="Description"
              errorMessage={meta.touched && meta.error ? meta.error : undefined}
            >
              <TextareaComponent
                value={field.value}
                onChange={e => {
                  setFieldValue(field.name, e.target.value);
                  setFieldTouched(field.name, true);
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
              label="Member"
              errorMessage={meta.touched && meta.error ? meta.error : undefined}
            >
              <AddressInput
                value={field.value}
                onChange={e => {
                  setFieldValue(field.name, e.target.value);
                  setFieldTouched(field.name, true);
                }}
              />
            </LabelWrapper>
          )}
        </Field>
      </FormControl>
    </Box>
  );
}
