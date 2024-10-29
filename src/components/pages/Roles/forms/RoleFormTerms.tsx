import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Flex,
  FormControl,
  Icon,
  IconButton,
  Text,
} from '@chakra-ui/react';
import { CaretDown, CaretRight, Plus, X } from '@phosphor-icons/react';
import { Field, FieldProps, useFormikContext } from 'formik';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getAddress } from 'viem';
import { DETAILS_BOX_SHADOW } from '../../../../constants/common';
import { DatePicker } from '../../../ui/forms/DatePicker';
import { AddressInput } from '../../../ui/forms/EthAddressInput';
import LabelWrapper from '../../../ui/forms/LabelWrapper';
import RoleTerm, { RoleTermStatus } from '../RoleTerm';
import { RoleFormValues } from '../types';

function RoleTermEndDateInput({ termIndex }: { termIndex: number }) {
  const { t } = useTranslation('roles');
  return (
    <FormControl>
      <Field name={`roleEditing.roleTerms[${termIndex}].termEndDate`}>
        {({ field, meta, form: { setFieldValue } }: FieldProps<Date, RoleFormValues>) => (
          <LabelWrapper
            label={t('termEndDate')}
            errorMessage={meta.touched && meta.error ? meta.error : undefined}
            isRequired
            labelColor="neutral-7"
          >
            <DatePicker
              onChange={(date: Date) => setFieldValue(field.name, date)}
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

function RoleTermCreate({ onClose, termIndex }: { termIndex: number; onClose: () => void }) {
  const { t } = useTranslation('roles');
  const { values, setFieldValue } = useFormikContext<RoleFormValues>();
  return (
    <Box>
      <Flex
        p="1rem"
        bg="neutral-2"
        boxShadow={DETAILS_BOX_SHADOW}
        borderTopRadius="0.5rem"
        gap="1rem"
        justifyContent="space-between"
        w="full"
      >
        <Text>{t('termNumber', { number: termIndex + 1 })}</Text>

        <IconButton
          variant="tertiary"
          size="icon-sm"
          aria-label="Close Drawer"
          as={X}
          hidden={termIndex === 0}
          onClick={() => {
            // remove term from the form
            setFieldValue(
              'roleEditing.roleTerms',
              values?.roleEditing?.roleTerms?.filter((_, index) => index !== termIndex),
            );
            onClose();
          }}
        />
      </Flex>
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
            setFieldValue(`roleEditing.roleTerms[${termIndex}]`, {
              nominee: '',
              termEndDate: undefined,
              termNumber: termIndex + 1,
            });
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
  const { t } = useTranslation('roles');
  if (!roleTerms?.length) {
    return null;
  }
  return (
    <Box>
      <Accordion allowToggle>
        <AccordionItem
          bg="neutral-2"
          borderTop="none"
          borderBottom="none"
          borderTopRadius="0.5rem"
          borderBottomRadius="0.5rem"
        >
          {({ isExpanded }) => (
            <>
              <AccordionButton
                bg="neutral-2"
                borderTopRadius="0.5rem"
                borderBottomRadius="0.5rem"
                p="1rem"
              >
                <Flex
                  alignItems="center"
                  gap={2}
                >
                  <Icon
                    as={!isExpanded ? CaretDown : CaretRight}
                    boxSize="1.25rem"
                    color="lilac-0"
                  />
                  <Text
                    textStyle="button-base"
                    color="lilac-0"
                  >
                    {t('showExpiredTerms')}
                  </Text>
                </Flex>
              </AccordionButton>
              <Flex
                flexDir="column"
                gap={4}
              >
                {roleTerms.map((term, index) => {
                  return (
                    <AccordionPanel
                      key={index}
                      px="1rem"
                    >
                      <RoleTermRenderer
                        key={index}
                        roleTerm={term}
                        termStatus="expired"
                      />
                    </AccordionPanel>
                  );
                })}
              </Flex>
            </>
          )}
        </AccordionItem>
      </Accordion>
    </Box>
  );
}

export default function RoleFormTerms() {
  const [newTermIndex, setNewTermIndex] = useState<number>();
  const { t } = useTranslation('roles');
  const { values } = useFormikContext<RoleFormValues>();

  const roleFormTerms = useMemo(
    () => values.roleEditing?.roleTerms || [],
    [values.roleEditing?.roleTerms],
  );

  // @dev shows the term form when there are no terms
  useEffect(() => {
    if (!roleFormTerms.length) {
      setNewTermIndex(0);
    }
  }, [roleFormTerms]);

  const expiredTerms = roleFormTerms
    .filter(term => !!term.termEndDate && term.termEndDate < new Date())
    .sort((a, b) => {
      if (!a.termEndDate || !b.termEndDate) {
        return 0;
      }
      return b.termEndDate.getTime() - a.termEndDate.getTime();
    });

  // {assumption}: only 2 terms should be unexpired at a time
  const terms = roleFormTerms.filter(term => !!term.termEndDate && term.termEndDate >= new Date());
  const [currentTerm, nextTerm] = terms;
  if (terms.length > 2) {
    throw new Error('More than 2 terms are active');
  }

  return (
    <Box>
      <Button
        variant="secondary"
        size="sm"
        mb={4}
        isDisabled={!!newTermIndex || terms.length > 2 || !roleFormTerms.length}
        onClick={() => {
          setNewTermIndex(roleFormTerms.length);
        }}
      >
        <Icon
          as={Plus}
          boxSize="1rem"
        />
        {t('addTerm')}
      </Button>
      <Flex
        flexDir="column"
        gap={4}
      >
        {newTermIndex !== undefined && (
          <RoleTermCreate
            termIndex={newTermIndex}
            onClose={() => setNewTermIndex(undefined)}
          />
        )}
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
