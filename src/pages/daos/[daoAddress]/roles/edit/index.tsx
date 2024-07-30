import { Box, Button, Flex, Show } from '@chakra-ui/react';
import { Plus } from '@phosphor-icons/react';
import { Formik } from 'formik';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useNavigate } from 'react-router-dom';
import { Hex } from 'viem';
import { RoleCardEdit } from '../../../../../components/pages/Roles/RoleCard';
import {
  RoleCardLoading,
  RoleCardNoRoles,
} from '../../../../../components/pages/Roles/RolePageCard';
import { RolesEditTable } from '../../../../../components/pages/Roles/RolesTable';
import {
  RoleFormValues,
  getNewRole,
  EditBadgeStatus,
} from '../../../../../components/pages/Roles/types';
import PageHeader from '../../../../../components/ui/page/Header/PageHeader';
import { DAO_ROUTES } from '../../../../../constants/routes';
import { useRolesSchema } from '../../../../../hooks/schemas/roles/useRolesSchema';
import useCreateRoles from '../../../../../hooks/utils/useCreateRoles';
import { useFractal } from '../../../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../../../providers/NetworkConfig/NetworkConfigProvider';
import { useRolesState } from '../../../../../state/useRolesState';

function RolesEdit() {
  const { t } = useTranslation(['roles', 'navigation', 'modals', 'common']);
  const {
    node: { daoAddress, safe },
  } = useFractal();
  const { addressPrefix } = useNetworkConfig();

  const { rolesSchema } = useRolesSchema();
  const { hatsTree } = useRolesState();

  const navigate = useNavigate();
  const { createRolesEditProposal } = useCreateRoles();

  function generateRoleProposalTitle({ formValues }: { formValues: RoleFormValues }) {
    const filteredHats = formValues.hats.filter(hat => !!hat.editedRole);
    const addedHatsCount = filteredHats.filter(
      hat => hat.editedRole!.status === EditBadgeStatus.New,
    ).length;
    const updatedHatsCount = filteredHats.filter(
      hat => hat.editedRole!.status === EditBadgeStatus.Updated,
    ).length;
    const removedHatsCount = filteredHats.filter(
      hat => hat.editedRole!.status === EditBadgeStatus.Removed,
    ).length;

    const addedHatsText = addedHatsCount > 0 ? t('addedHats', { count: addedHatsCount }) : '';

    const updatedHatsText =
      updatedHatsCount > 0 ? t('updatedHats', { count: updatedHatsCount }) : '';

    const removedHatsText =
      removedHatsCount > 0 ? t('removedHats', { count: removedHatsCount }) : '';

    return [addedHatsText, updatedHatsText, removedHatsText].filter(Boolean).join('. ');
  }

  const initialValues = useMemo(() => {
    return {
      proposalMetadata: {
        title: '',
        description: '',
      },
      hats: hatsTree?.roleHats || [],
      customNonce: safe?.nextNonce || 0,
    };
  }, [hatsTree?.roleHats, safe?.nextNonce]);

  if (daoAddress === null) return null;

  const showRoleEditDetails = (hatId: Hex) => {
    navigate(DAO_ROUTES.rolesEditDetails.relative(addressPrefix, daoAddress, hatId));
  };

  return (
    <Formik<RoleFormValues>
      initialValues={initialValues}
      enableReinitialize
      validationSchema={rolesSchema}
      validateOnMount
      onSubmit={createRolesEditProposal}
    >
      {({ handleSubmit, values, touched, setFieldValue }) => (
        <form onSubmit={handleSubmit}>
          <Box>
            <PageHeader
              title={t('roles')}
              breadcrumbs={[
                {
                  terminus: t('roles'),
                  path: DAO_ROUTES.roles.relative(addressPrefix, daoAddress),
                },
                {
                  terminus: t('editRoles'),
                  path: '',
                },
              ]}
              buttonVariant="secondary"
              buttonText={t('addRole')}
              buttonProps={{
                size: 'sm',
                leftIcon: <Plus />,
              }}
              buttonClick={() => {
                const newRole = getNewRole();
                setFieldValue('roleEditing', newRole);
                showRoleEditDetails(newRole.id);
              }}
            />

            <Show above="md">
              <RolesEditTable handleRoleClick={showRoleEditDetails} />
            </Show>
            <Show below="md">
              {hatsTree === undefined && <RoleCardLoading />}
              {(hatsTree === null || !values.hats.length) && <RoleCardNoRoles />}
              {values.hats.map(hat => (
                <RoleCardEdit
                  key={hat.id}
                  name={hat.name}
                  wearerAddress={hat.wearer}
                  editStatus={hat.editedRole?.status}
                  handleRoleClick={() => {
                    setFieldValue('roleEditing', hat);
                    showRoleEditDetails(hat.id);
                  }}
                  payments={hat.payments}
                />
              ))}
            </Show>
          </Box>
          <Flex
            mt="1rem"
            gap="1rem"
            justifyContent="flex-end"
          >
            <Button
              variant="tertiary"
              onClick={() => navigate(DAO_ROUTES.roles.relative(addressPrefix, daoAddress))}
            >
              {t('cancel', { ns: 'common' })}
            </Button>
            <Button
              onClick={() => {
                if (!touched.proposalMetadata?.title || !values.proposalMetadata.title) {
                  setFieldValue(
                    'proposalMetadata.title',
                    generateRoleProposalTitle({ formValues: values }),
                  );
                }
                navigate(
                  DAO_ROUTES.rolesEditCreateProposalSummary.relative(addressPrefix, daoAddress),
                );
              }}
              isDisabled={!values.hats.some(hat => hat.editedRole)}
            >
              {t('createProposal', { ns: 'modals' })}
            </Button>
          </Flex>
          <Outlet />
        </form>
      )}
    </Formik>
  );
}

export default RolesEdit;
