import { Box, Button, Flex, FormControl, Show } from '@chakra-ui/react';
import { Field, FieldProps, useFormikContext } from 'formik';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Hex } from 'viem';
import { CARD_SHADOW } from '../../../../constants/common';
import { DAO_ROUTES } from '../../../../constants/routes';
import { useFractal } from '../../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../../providers/NetworkConfig/NetworkConfigProvider';
import { CustomNonceInput } from '../../../ui/forms/CustomNonceInput';
import { InputComponent, TextareaComponent } from '../../../ui/forms/InputComponent';
import LabelWrapper from '../../../ui/forms/LabelWrapper';
import { RoleCardEdit } from '../RoleCard';
import RolesDetailsDrawer from '../RolesDetailsDrawer';
import RolesDetailsDrawerMobile from '../RolesDetailsDrawerMobile';
import { RoleFormValues, RoleValue } from '../types';

export default function RoleFormCreateProposal({ close }: { close: () => void }) {
  const [drawerViewingRole, setDrawerViewingRole] = useState<RoleValue>();
  const { t } = useTranslation(['modals', 'common', 'proposal']);
  const { values, isSubmitting, submitForm } = useFormikContext<RoleFormValues>();
  const editedRoles = useMemo(() => {
    return values.hats.filter(hat => !!hat.editedRole);
  }, [values.hats]);

  const {
    node: { daoAddress },
  } = useFractal();
  const navigate = useNavigate();
  const { addressPrefix } = useNetworkConfig();

  const handleEditRoleClick = useCallback(
    (hatId: Hex) => {
      if (!!daoAddress) {
        navigate(DAO_ROUTES.rolesEditDetails.relative(addressPrefix, daoAddress, hatId));
      }
    },
    [navigate, addressPrefix, daoAddress],
  );

  const handleCloseDrawer = () => setDrawerViewingRole(undefined);

  return (
    <Box maxW="736px">
      <Flex
        flexDir="column"
        gap="1rem"
        p="1rem"
        bg="neutral-2"
        maxW="736px"
        boxShadow={CARD_SHADOW}
        borderRadius="0.5rem"
      >
        <FormControl>
          <Field name="proposalMetadata.title">
            {({
              field,
              form: { setFieldValue, setFieldTouched },
            }: FieldProps<string, RoleFormValues>) => (
              <LabelWrapper label={t('proposalTitle', { ns: 'proposal' })}>
                <InputComponent
                  value={field.value}
                  onChange={e => {
                    setFieldValue(field.name, e.target.value);
                    setFieldTouched(field.name, true);
                  }}
                  testId={field.name}
                  placeholder="Proposal Title"
                  isRequired={false}
                />
              </LabelWrapper>
            )}
          </Field>
        </FormControl>
        <FormControl>
          <Field name="proposalMetadata.description">
            {({
              field,
              form: { setFieldValue, setFieldTouched },
            }: FieldProps<string, RoleFormValues>) => (
              <LabelWrapper label={t('proposalDescription', { ns: 'proposal' })}>
                <TextareaComponent
                  value={field.value}
                  onChange={e => {
                    setFieldValue(field.name, e.target.value);
                    setFieldTouched(field.name, true);
                  }}
                  isRequired={false}
                  placeholder={t('proposalDescriptionPlaceholder', { ns: 'proposal' })}
                />
              </LabelWrapper>
            )}
          </Field>
        </FormControl>

        <FormControl>
          <Field name="customNonce">
            {({ form: { setFieldValue } }: FieldProps<string, RoleFormValues>) => (
              <Flex
                w="100%"
                justifyContent="flex-end"
              >
                <CustomNonceInput
                  nonce={values.customNonce}
                  onChange={newNonce => setFieldValue('customNonce', newNonce ?? undefined)}
                />
              </Flex>
            )}
          </Field>
        </FormControl>
      </Flex>
      <Box
        p="1rem"
        bg="neutral-2"
        boxShadow={CARD_SHADOW}
        borderRadius="0.5rem"
      >
        {editedRoles.map((role, index) => (
          <RoleCardEdit
            key={index}
            wearerAddress={role.wearer}
            name={role.name}
            handleRoleClick={() => {
              setDrawerViewingRole(role);
            }}
            editStatus={role.editedRole?.status}
          />
        ))}
      </Box>
      <Flex
        gap="1rem"
        mt="1rem"
        justifyContent="flex-end"
      >
        <Button
          variant="tertiary"
          onClick={close}
        >
          {t('cancel', { ns: 'common' })}
        </Button>
        <Button
          onClick={submitForm}
          isDisabled={isSubmitting}
        >
          {t('submitProposal')}
        </Button>
      </Flex>
      {drawerViewingRole !== undefined && (
        <>
          <Show below="md">
            <RolesDetailsDrawerMobile
              roleHat={drawerViewingRole}
              isOpen={drawerViewingRole !== undefined}
              onClose={handleCloseDrawer}
              onEdit={handleEditRoleClick}
            />
          </Show>
          <Show above="md">
            <RolesDetailsDrawer
              roleHat={drawerViewingRole}
              isOpen={drawerViewingRole !== undefined}
              onClose={handleCloseDrawer}
              onEdit={handleEditRoleClick}
            />
          </Show>
        </>
      )}
    </Box>
  );
}
