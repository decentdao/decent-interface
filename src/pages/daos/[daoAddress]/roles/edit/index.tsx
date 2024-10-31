import * as amplitude from '@amplitude/analytics-browser';
import { Box, Button, Flex, Hide, Show } from '@chakra-ui/react';
import { Plus } from '@phosphor-icons/react';
import { Formik } from 'formik';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useNavigate } from 'react-router-dom';
import { Hex, toHex } from 'viem';
import { RoleCardEdit } from '../../../../../components/pages/Roles/RoleCard';
import { RoleCardLoading } from '../../../../../components/pages/Roles/RolePageCard';
import { RolesEditTable } from '../../../../../components/pages/Roles/RolesTable';
import { EditBadgeStatus, RoleFormValues } from '../../../../../components/pages/Roles/types';
import DraggableDrawer from '../../../../../components/ui/containers/DraggableDrawer';
import NoDataCard from '../../../../../components/ui/containers/NoDataCard';
import { ModalBase } from '../../../../../components/ui/modals/ModalBase';
import PageHeader from '../../../../../components/ui/page/Header/PageHeader';
import { DAO_ROUTES } from '../../../../../constants/routes';
import { getRandomBytes } from '../../../../../helpers';
import { useRolesSchema } from '../../../../../hooks/schemas/roles/useRolesSchema';
import useCreateRoles from '../../../../../hooks/utils/useCreateRoles';
import { useNavigationBlocker } from '../../../../../hooks/utils/useNavigationBlocker';
import { analyticsEvents } from '../../../../../insights/analyticsEvents';
import { useFractal } from '../../../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../../../providers/NetworkConfig/NetworkConfigProvider';
import { useRolesStore } from '../../../../../store/roles/useRolesStore';
import { UnsavedChangesWarningContent } from './unsavedChangesWarningContent';

function RolesEdit() {
  useEffect(() => {
    amplitude.track(analyticsEvents.RolesEditPageOpened);
  }, []);

  const { t } = useTranslation(['roles', 'navigation', 'modals', 'common']);
  const {
    node: { daoAddress, safe },
  } = useFractal();
  const { addressPrefix } = useNetworkConfig();

  const { rolesSchema } = useRolesSchema();
  const { hatsTree } = useRolesStore();

  const navigate = useNavigate();
  const { createEditRolesProposal } = useCreateRoles();

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

  const initialValues: RoleFormValues = useMemo(() => {
    const hats = hatsTree?.roleHats || [];
    return {
      proposalMetadata: {
        title: '',
        description: '',
      },
      hats: hats.map(hat => ({
        ...hat,
        resolvedWearer: hat.wearerAddress,
        wearer: hat.wearerAddress,
        roleTerms: hat.roleTerms.allTerms,
      })),
      customNonce: safe?.nextNonce || 0,
      actions: [],
    };
  }, [hatsTree?.roleHats, safe?.nextNonce]);

  const [hasEditedRoles, setHasEditedRoles] = useState(false);

  const blocker = useNavigationBlocker({ roleEditPageNavigationBlockerParams: { hasEditedRoles } });

  if (daoAddress === null) return null;

  const showRoleEditDetails = (roleId: Hex) => {
    navigate(DAO_ROUTES.rolesEditDetails.relative(addressPrefix, daoAddress, roleId));
  };

  const hatsTreeLoading = hatsTree === undefined;
  const showNoRolesCard = !hatsTreeLoading && (hatsTree === null || hatsTree.roleHats.length === 0);

  return (
    <Formik<RoleFormValues>
      initialValues={initialValues}
      enableReinitialize
      validationSchema={rolesSchema}
      validateOnMount
      onSubmit={createEditRolesProposal}
    >
      {({ handleSubmit, values, touched, setFieldValue }) => (
        <form onSubmit={handleSubmit}>
          {blocker.state === 'blocked' && (
            <>
              <Hide above="md">
                <DraggableDrawer
                  isOpen
                  onClose={() => {}}
                  onOpen={() => {}}
                  headerContent={null}
                  initialHeight="23rem"
                  closeOnOverlayClick={false}
                >
                  <UnsavedChangesWarningContent
                    onDiscard={blocker.proceed}
                    onKeepEditing={blocker.reset}
                  />
                </DraggableDrawer>
              </Hide>
              <Hide below="md">
                <ModalBase
                  isOpen
                  title=""
                  onClose={() => {}}
                  isSearchInputModal={false}
                >
                  <UnsavedChangesWarningContent
                    onDiscard={blocker.proceed}
                    onKeepEditing={blocker.reset}
                  />
                </ModalBase>
              </Hide>
            </>
          )}
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
              buttonProps={{
                variant: 'secondary',
                children: t('addRole'),
                size: 'sm',
                gap: 0,
                leftIcon: (
                  <Box mr="-0.25rem">
                    <Plus size="1rem" />
                  </Box>
                ),
                onClick: async () => {
                  const newId = toHex(getRandomBytes(), { size: 32 });
                  setFieldValue('roleEditing', { id: newId });
                  showRoleEditDetails(newId);
                },
              }}
            />

            <Show above="md">
              <RolesEditTable handleRoleClick={showRoleEditDetails} />
            </Show>
            <Show below="md">
              {hatsTree === undefined && <RoleCardLoading />}
              {showNoRolesCard && values.hats.length === 0 && (
                <NoDataCard
                  translationNameSpace="roles"
                  emptyText="noRoles"
                  emptyTextNotProposer="noRolesNotProposer"
                />
              )}
              {values.hats.map(hat => (
                <RoleCardEdit
                  key={hat.id}
                  name={hat.name}
                  wearerAddress={hat.resolvedWearer}
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
              onClick={() => {
                setHasEditedRoles(values.hats.some(hat => !!hat.editedRole));
                setTimeout(
                  () =>
                    navigate(DAO_ROUTES.roles.relative(addressPrefix, daoAddress), {
                      replace: true,
                    }),
                  50,
                );
              }}
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
                if (blocker.reset) {
                  blocker.reset();
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
