import { Box, Button, Flex, FormControl, Icon, IconButton, Text } from '@chakra-ui/react';
import { Plus, X } from '@phosphor-icons/react';
import { Field, FieldProps, useFormikContext } from 'formik';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { getAddress, Hex } from 'viem';
import { usePublicClient } from 'wagmi';
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
  const publicClient = usePublicClient();

  const handleAddTerm = async () => {
    if (!values.newRoleTerm?.nominee || !values.newRoleTerm?.termEndDate) {
      throw new Error('Nominee and Term End Date are required');
    }
    if (!publicClient) {
      throw new Error('Public client is not available');
    }
    let nomineeAddress = values.newRoleTerm.nominee;
    if (!values.newRoleTerm.nominee.startsWith('0x') && !getAddress(values.newRoleTerm.nominee)) {
      const ens = await publicClient.getEnsAddress({
        name: values.newRoleTerm.nominee,
      });
      if (ens) {
        nomineeAddress = ens;
      }
    }

    setFieldValue('roleEditing.roleTerms', [
      ...(values?.roleEditing?.roleTerms || []),
      {
        nominee: nomineeAddress,
        termEndDate: values.newRoleTerm.termEndDate,
        termNumber: termIndex + 1,
      },
    ]);
    toast.info(t('termSavedSuccessfully'));
    onClose();
  };
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
          onClick={handleAddTerm}
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
  hatId,
}: {
  roleTerm?: {
    nominee?: string;
    termEndDate?: Date;
    termNumber: number;
  };
  termStatus: RoleFormTermStatus;
  hatId: Hex | undefined;
}) {
  if (!roleTerm?.nominee || !roleTerm?.termEndDate) {
    return null;
  }
  return (
    <Box>
      <RoleTerm
        hatId={hatId}
        termNominatedWearer={getAddress(roleTerm.nominee)}
        termEndDate={roleTerm.termEndDate}
        termStatus={termStatus}
        termNumber={roleTerm.termNumber}
      />
    </Box>
  );
}

export default function RoleFormTerms() {
  const { t } = useTranslation('roles');
  const { values, setFieldValue } = useFormikContext<RoleFormValues>();
  const { getHat } = useRolesStore();
  const roleFormHatId = values.roleEditing?.id;

  const roleHatTerms = useMemo(() => {
    if (!roleFormHatId) {
      return undefined;
    }
    const hat = getHat(roleFormHatId);
    return hat?.roleTerms;
  }, [getHat, roleFormHatId]);

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
          hatId={roleFormHatId}
          roleTerm={terms[1]}
          termStatus={
            roleHatTerms?.nextTerm ? RoleFormTermStatus.Queued : RoleFormTermStatus.Pending
          }
        />
        <RoleTermRenderer
          hatId={roleFormHatId}
          roleTerm={terms[0]}
          // @dev show queued if term is being created
          termStatus={
            roleHatTerms?.currentTerm ? RoleFormTermStatus.Current : RoleFormTermStatus.Pending
          }
        />
      </Flex>
    </Box>
  );
}
