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
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getAddress } from 'viem';
import { DETAILS_BOX_SHADOW } from '../../../../constants/common';
import { useRolesStore } from '../../../../store/roles/useRolesStore';
import { DatePicker } from '../../../ui/forms/DatePicker';
import { AddressInput } from '../../../ui/forms/EthAddressInput';
import LabelWrapper from '../../../ui/forms/LabelWrapper';
import RoleTerm from '../RoleTerm';
import { RoleFormTermStatus, RoleFormValues } from '../types';

function RoleTermEndDateInput() {
  const { t } = useTranslation('roles');
  return (
    <FormControl>
      <Field name="newRoleTerm.termEndDate">
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

function RoleTermMemberInput() {
  const { t } = useTranslation('roles');
  return (
    <FormControl>
      <Field name="newRoleTerm.nominee">
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
  const { values, errors, setFieldValue } = useFormikContext<RoleFormValues>();
  console.log('🚀 ~ errors:', errors);

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
        <RoleTermMemberInput />
        <RoleTermEndDateInput />
        <Button
          isDisabled={!!errors.newRoleTerm}
          onClick={() => {
            if (!values.newRoleTerm?.nominee || !values.newRoleTerm?.termEndDate) {
              throw new Error('Nominee and Term End Date are required');
            }
            setFieldValue('roleEditing.roleTerms', [
              ...(values?.roleEditing?.roleTerms || []),
              {
                nominee: values.newRoleTerm.nominee,
                termEndDate: values.newRoleTerm.termEndDate,
                termNumber: termIndex + 1,
              },
            ]);

            onClose();
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
  termStatus: RoleFormTermStatus;
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
                        termStatus={RoleFormTermStatus.Expired}
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
  const { t } = useTranslation('roles');
  const { values, setFieldValue } = useFormikContext<RoleFormValues>();
  const { getHat } = useRolesStore();

  const roleHatTerms = useMemo(() => {
    const roleFormHatId = values.roleEditing?.id;
    const hat = getHat(roleFormHatId || '0x');
    return hat?.roleTerms;
  }, [getHat, values.roleEditing?.id]);

  const roleFormTerms = useMemo(
    () => values.roleEditing?.roleTerms || [],
    [values.roleEditing?.roleTerms],
  );

  // {assumption}: only 2 terms should be unexpired at a time
  const terms = useMemo(() => {
    return roleFormTerms.filter(term => !!term.termEndDate && term.termEndDate >= new Date());
  }, [roleFormTerms]);

  // @dev shows the term form when there are no terms
  useEffect(() => {
    if (terms[0] === undefined && values.newRoleTerm === undefined) {
      setFieldValue('newRoleTerm', {
        nominee: '',
        termEndDate: undefined,
      });
    }
  }, [values.newRoleTerm, setFieldValue, terms]);

  return (
    <Box>
      <Button
        variant="secondary"
        size="sm"
        mb={4}
        isDisabled={!!values.newRoleTerm || terms.length == 2 || !roleFormTerms.length}
        onClick={() => {
          setFieldValue('newRoleTerm', {
            nominee: '',
            termEndDate: undefined,
          });
        }}
        leftIcon={
          <Icon
            as={Plus}
            boxSize="1rem"
          />
        }
      >
        {t('addTerm')}
      </Button>
      <Flex
        flexDir="column"
        gap={4}
      >
        {values.newRoleTerm !== undefined && (
          <RoleTermCreate
            termIndex={roleFormTerms.length}
            onClose={() => setFieldValue('newRoleTerm', undefined)}
          />
        )}
        <RoleTermRenderer
          roleTerm={terms[1]}
          termStatus={
            roleHatTerms?.nextTerm ? RoleFormTermStatus.Queued : RoleFormTermStatus.Pending
          }
        />
        <RoleTermRenderer
          roleTerm={terms[0]}
          // @dev show queued if term is being created
          termStatus={
            roleHatTerms?.currentTerm ? RoleFormTermStatus.Current : RoleFormTermStatus.Pending
          }
        />
        <RoleTermExpiredTerms roleTerms={roleHatTerms?.expiredTerms} />
      </Flex>
    </Box>
  );
}
