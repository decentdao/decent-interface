import { Box, FormControl } from '@chakra-ui/react';
import { Field, FieldProps } from 'formik';
import { AddressInput } from '../../../ui/forms/EthAddressInput';
import { InputComponent, TextareaComponent } from '../../../ui/forms/InputComponent';
import LabelWrapper from '../../../ui/forms/LabelWrapper';
import { RoleFormValues } from '../types';

export default function RoleFormInfo({ hatIndex }: { hatIndex: number }) {
  return (
    <Box
      p="1rem"
      bg="neutral-2"
      boxShadow="0 1px 0 0 rgba(248, 244, 252, 0.04), 0 1px 1px 0 rgba(248, 244, 252, 0.04), 0 0 1px 1px rgba(16, 4, 20, 1)"
      borderRadius="0.5rem"
    >
      <FormControl>
        <Field name={`hats.${hatIndex}.roleName`}>
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
              />
            </LabelWrapper>
          )}
        </Field>
      </FormControl>
      <FormControl>
        <Field name={`hats.${hatIndex}.roleDescription`}>
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
              />
            </LabelWrapper>
          )}
        </Field>
      </FormControl>
      <FormControl>
        <Field name={`hats.${hatIndex}.member`}>
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
