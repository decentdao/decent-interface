import { Box, Button, Flex, FormControl, Icon, Text } from '@chakra-ui/react';
import { Plus } from '@phosphor-icons/react';
import { Field, FieldProps, useFormikContext } from 'formik';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getAddress, zeroAddress } from 'viem';
import { DETAILS_BOX_SHADOW } from '../../../../constants/common';
import { AddressInput } from '../../../ui/forms/EthAddressInput';
import LabelWrapper from '../../../ui/forms/LabelWrapper';
import RoleTerm, { RoleTermStatus } from '../RoleTerm';
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

function RoleTermRenderer({
  roleTerm,
  termStatus,
}: {
  roleTerm?: {
    nominee?: string;
    termEndDate?: Date;
    termNumber: number;
  };
  termStatus: RoleTermStatus;
}) {
  if (!roleTerm?.nominee || !roleTerm?.termEndDate) {
    return null;
  }
  return (
    <Box>
      <RoleTerm
        memberAddress={getAddress(roleTerm.nominee)}
        termEndDate={roleTerm.termEndDate}
        termStatus={termStatus}
        termNumber={roleTerm.termNumber}
      />
    </Box>
  );
}

function RoleTermExpiredTerms({
  roleTerms,
}: {
  roleTerms?: {
    nominee?: string;
    termEndDate?: Date;
    termNumber: number;
  }[];
}) {
  if (!roleTerms) {
    return null;
  }
  return (
    <Box>
      {roleTerms.map((term, index) => {
        return (
          <RoleTermRenderer
            key={index}
            roleTerm={term}
            termStatus="expired"
          />
        );
      })}
    </Box>
  );
}

export default function RoleFormTerms() {
  const [showAddTerm, setShowAddTerm] = useState(false);
  const { t } = useTranslation('roles');
  const { values } = useFormikContext<RoleFormValues>();
  const roleFormTerms =
    values.roleEditing?.roleTerms
      ?.sort(
        (a, b) => (a.termEndDate ?? new Date()).getTime() - (b.termEndDate ?? new Date()).getTime(),
      )
      .map((term, index) => ({ ...term, termNumber: index + 1 })) ||
    [
      {
        nominee: zeroAddress,
        termEndDate: new Date('2024-10-10'),
      },
      {
        nominee: zeroAddress,
        termEndDate: new Date('2025-10-22'),
      },
      {
        nominee: zeroAddress,
        termEndDate: new Date('2026-10-27'),
      },
      {
        nominee: zeroAddress,
        termEndDate: new Date('2024-10-9'),
      },
    ]
      .sort(
        (a, b) => (a.termEndDate ?? new Date()).getTime() - (b.termEndDate ?? new Date()).getTime(),
      )
      .map((term, index) => ({ ...term, termNumber: index + 1 }));

  const expiredTerms = roleFormTerms.filter(
    term => !!term.termEndDate && term.termEndDate < new Date(),
  );
  // {assumption}: only 2 terms should be unexpired at a time
  const terms = roleFormTerms.filter(term => !!term.termEndDate && term.termEndDate >= new Date());
  const currentTerm = terms[0];
  const nextTerm = terms[1];
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
      <Flex
        flexDir="column"
        gap={4}
      >
        {(showAddTerm || !roleFormTerms.length) && <RoleTermCreate termIndex={0} />}
        <RoleTermRenderer
          roleTerm={nextTerm}
          termStatus="queued"
        />
        <RoleTermRenderer
          roleTerm={currentTerm}
          termStatus="current"
        />
        <RoleTermExpiredTerms roleTerms={expiredTerms} />
      </Flex>
    </Box>
  );
}
