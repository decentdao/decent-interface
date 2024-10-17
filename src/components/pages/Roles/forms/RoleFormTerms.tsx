import { Box, Button, FormControl, Icon, Text } from '@chakra-ui/react';
import { Plus } from '@phosphor-icons/react';
import { Field, FieldProps, useFormikContext } from 'formik';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DETAILS_BOX_SHADOW } from '../../../../constants/common';
import { AddressInput } from '../../../ui/forms/EthAddressInput';
import LabelWrapper from '../../../ui/forms/LabelWrapper';
import RoleTerm from '../RoleTerm';
import { RoleFormValues } from '../types';
import { RoleTermEndDatePicker } from './RoleTermEndDatePicker';

function RoleTermEndDateInput({ termIndex }: { termIndex: number }) {
  const { t } = useTranslation('roles');
  return (
    <FormControl>
      <Field name={`roleEditing.roleTerms[${termIndex}].termEndDateTs`}>
        {({ field, meta }: FieldProps<Date, RoleFormValues>) => (
          <LabelWrapper
            label={t('Term End Date')}
            errorMessage={meta.touched && meta.error ? meta.error : undefined}
            isRequired
            labelColor="neutral-7"
          >
            <RoleTermEndDatePicker
              onChange={field.onChange}
              disabled={false}
              // @todo Set minDate to the end of the previous term
              minDate={new Date()}
              maxDate={undefined}
              selectedDate={field.value}
            />
          </LabelWrapper>
        )}
      </Field>
    </FormControl>
  );
}

function RoleTermMemberInput({ termIndex }: { termIndex: number }) {
  const { t } = useTranslation('roles');
  return (
    <FormControl>
      <Field name={`roleEditing.roleTerms[${termIndex}].nominee`}>
        {({
          field,
          form: { setFieldValue, setFieldTouched },
          meta,
        }: FieldProps<string, RoleFormValues>) => (
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
                setFieldValue(field.name, e.target.value);
              }}
            />
          </LabelWrapper>
        )}
      </Field>
    </FormControl>
  );
}

function RoleTermCreate({ termIndex }: { termIndex: number }) {
  const { t } = useTranslation('roles');
  return (
    <Box>
      <Box
        p="1rem"
        bg="neutral-2"
        boxShadow={DETAILS_BOX_SHADOW}
        borderTopRadius="0.5rem"
        display="flex"
        flexDirection="column"
        gap="1rem"
      >
        <Text>{t('Term 1')}</Text>
      </Box>
      <Box
        p="1rem"
        bg="neutral-2"
        boxShadow={DETAILS_BOX_SHADOW}
        borderBottomRadius="0.5rem"
        display="flex"
        flexDirection="column"
        gap="1rem"
      >
        <RoleTermMemberInput termIndex={termIndex} />
        <RoleTermEndDateInput termIndex={termIndex} />
        <Button
          onClick={() => {
            // @todo Add term
          }}
        >
          {t('Add Term')}
        </Button>
      </Box>
    </Box>
  );
}

export default function RoleFormTerms() {
  const [showAddTerm, setShowAddTerm] = useState(false);
  const { t } = useTranslation('roles');
  const { values } = useFormikContext<RoleFormValues>();
  const roleTerms = values.roleEditing?.roleTerms || [{}];
  return (
    <Box>
      <Button
        variant="secondary"
        size="sm"
        mb={4}
        onClick={() => {
          // @todo show add term form
          setShowAddTerm(true);
        }}
      >
        <Icon
          as={Plus}
          boxSize="1rem"
        />
        {t('Add term')}
      </Button>
      {/* @todo Hide when not creating terms */}
      {(showAddTerm || !roleTerms.length) && <RoleTermCreate termIndex={0} />}
      {roleTerms.map((term, index) => (
        <RoleTerm key={index} />
      ))}
    </Box>
  );
}
