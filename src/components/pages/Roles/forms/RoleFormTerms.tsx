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
import { toast } from 'sonner';
import { getAddress, Hex } from 'viem';
import { usePublicClient, useWalletClient } from 'wagmi';
import { DETAILS_BOX_SHADOW } from '../../../../constants/common';
import { useRolesStore } from '../../../../store/roles/useRolesStore';
import { DatePicker } from '../../../ui/forms/DatePicker';
import { AddressInput } from '../../../ui/forms/EthAddressInput';
import LabelWrapper from '../../../ui/forms/LabelWrapper';
import RoleTerm from '../RoleTerm';
import { RoleFormTermStatus, RoleFormValues } from '../types';

function RoleTermEndDateInput({ previousTermEndDate }: { previousTermEndDate: Date | undefined }) {
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
              minDate={previousTermEndDate ?? new Date(new Date().setHours(0, 0, 0, 0))}
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

function RoleTermCreate({
  onClose,
  previousTermEndDate,
  termIndex,
}: {
  termIndex: number;
  previousTermEndDate: Date | undefined;
  onClose: () => void;
}) {
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
        <RoleTermEndDateInput previousTermEndDate={previousTermEndDate} />
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
  displayLightContainer,
}: {
  roleTerm?: {
    nominee?: string;
    termEndDate?: Date;
    termNumber: number;
  };
  termStatus: RoleFormTermStatus;
  hatId: Hex | undefined;
  displayLightContainer?: boolean;
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
        displayLightContainer={displayLightContainer}
      />
    </Box>
  );
}

function RoleTermExpiredTerms({
  hatId,
  roleTerms,
}: {
  hatId: Hex | undefined;
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
    <Box
      borderRadius="0.5rem"
      boxShadow="layeredShadowBorder"
    >
      <Accordion allowToggle>
        <AccordionItem
          borderTop="none"
          borderBottom="none"
          borderTopRadius="0.5rem"
          borderBottomRadius="0.5rem"
        >
          {({ isExpanded }) => (
            <>
              <AccordionButton
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
                    {t('showPreviousTerms')}
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
                        hatId={hatId}
                        roleTerm={term}
                        termStatus={RoleFormTermStatus.Expired}
                        displayLightContainer
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
  const roleFormHatId = values.roleEditing?.id;
  const { data: walletClient } = useWalletClient();
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

  // @note only 2 terms should be unexpired at a time
  const terms = useMemo(
    () =>
      roleFormTerms.filter(term => !!term.termEndDate && term.termEndDate.getTime() > Date.now()),
    [roleFormTerms],
  );

  // @dev shows the term form when there are no terms
  useEffect(() => {
    if (values.newRoleTerm === undefined && roleFormTerms.length === 0) {
      setFieldValue('newRoleTerm', {
        nominee: '',
        termEndDate: undefined,
      });
    }
  }, [values.newRoleTerm, setFieldValue, roleFormTerms.length]);

  const isAddButtonDisabled = useMemo(() => {
    const isFirstTermBeingCreated = !!values.newRoleTerm || !roleFormTerms.length;
    const isTermCreationPending = (roleHatTerms?.allTerms ?? []).length < roleFormTerms.length;
    const canCreateNewTerm = terms.length == 2;
    return isFirstTermBeingCreated || canCreateNewTerm || isTermCreationPending;
  }, [values.newRoleTerm, roleFormTerms.length, roleHatTerms?.allTerms, terms.length]);

  return (
    <>
      <Flex gap={2}>
        <Button
          textStyle="unstyled"
          bg="lightblue"
          onClick={() => {
            setFieldValue('newRoleTerm', {
              nominee: walletClient!.account.address,
              termEndDate: new Date(Date.now() + 10 * 60 * 1000),
            });
          }}
        >
          Add 10 Min Term
        </Button>
        <Button
          textStyle="unstyled"
          bg="lightblue"
          onClick={() => {
            setFieldValue('newRoleTerm', {
              nominee: walletClient!.account.address,
              termEndDate: new Date(Date.now() + 20 * 60 * 1000),
            });
          }}
        >
          Add 20 Min Term
        </Button>
      </Flex>
      <Button
        variant="secondary"
        size="sm"
        mb={4}
        isDisabled={isAddButtonDisabled}
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
            previousTermEndDate={[...roleFormTerms].pop()?.termEndDate}
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
        <RoleTermExpiredTerms
          hatId={roleFormHatId}
          roleTerms={roleHatTerms?.expiredTerms}
        />
      </Flex>
    </>
  );
}
