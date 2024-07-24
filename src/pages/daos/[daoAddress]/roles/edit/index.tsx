import { Box, Button, Flex, Show } from '@chakra-ui/react';
import { Plus } from '@phosphor-icons/react';
import { Formik, FormikHelpers } from 'formik';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Hex, getAddress, zeroAddress } from 'viem';
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
import useSubmitProposal from '../../../../../hooks/DAO/proposal/useSubmitProposal';
import { useRolesSchema } from '../../../../../hooks/schemas/roles/useRolesSchema';
import {
  parseEditedHatsFormValues,
  prepareCreateTopHatProposalData,
  prepareEditHatsProposalData,
} from '../../../../../hooks/utils/rolesProposalFunctions';
import { useFractal } from '../../../../../providers/App/AppProvider';
import useIPFSClient from '../../../../../providers/App/hooks/useIPFSClient';
import { useNetworkConfig } from '../../../../../providers/NetworkConfig/NetworkConfigProvider';
import { useRolesState } from '../../../../../state/useRolesState';
import { ProposalExecuteData } from '../../../../../types';

function RolesEdit() {
  const { t } = useTranslation(['roles', 'navigation', 'modals', 'common']);
  const {
    node: { daoAddress, safe, daoName },
  } = useFractal();
  const {
    addressPrefix,
    contracts: {
      hatsProtocol,
      decentHatsMasterCopy,
      hatsAccount1ofNMasterCopy,
      erc6551Registry,
      keyValuePairs,
    },
  } = useNetworkConfig();

  const { rolesSchema } = useRolesSchema();
  const { hatsTree, hatsTreeId, getHat } = useRolesState();

  const navigate = useNavigate();

  const { submitProposal } = useSubmitProposal();

  const ipfsClient = useIPFSClient();

  const submitProposalSuccessCallback = useCallback(() => {
    if (daoAddress) {
      navigate(DAO_ROUTES.proposals.relative(addressPrefix, daoAddress));
    }
  }, [daoAddress, addressPrefix, navigate]);

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

  const createRolesEditProposal = useCallback(
    async (values: RoleFormValues, formikHelpers: FormikHelpers<RoleFormValues>) => {
      const { setSubmitting } = formikHelpers;
      setSubmitting(true);
      if (!safe) {
        setSubmitting(false);
        throw new Error('Cannot create Roles proposal without known Safe');
      }

      try {
        // filter to hats that have been modified (ie includes `editedRole` prop)
        const modifiedHats = values.hats.filter(hat => !!hat.editedRole);
        let proposalData: ProposalExecuteData;

        const uploadHatDescriptionCallback = async (hatDescription: string) => {
          const { Hash } = await ipfsClient.add(hatDescription);
          return `ipfs://${Hash}`;
        };

        const editedHatStructs = await parseEditedHatsFormValues(
          modifiedHats,
          hatsTree?.topHat.smartAddress ?? zeroAddress, // dev: "should never be the zero address in practice"
          getHat,
          uploadHatDescriptionCallback,
        );

        if (!hatsTreeId) {
          // This safe has no top hat, so we prepare a proposal to create one. This will also create an admin hat,
          // along with any other hats that are added.
          proposalData = await prepareCreateTopHatProposalData(
            values.proposalMetadata,
            editedHatStructs.addedHats,
            getAddress(safe.address),
            uploadHatDescriptionCallback,
            daoName ?? safe.address,
            getAddress(decentHatsMasterCopy),
            hatsProtocol,
            hatsAccount1ofNMasterCopy,
            erc6551Registry,
            getAddress(keyValuePairs),
          );
        } else {
          if (!hatsTree) {
            throw new Error('Cannot edit Roles without a HatsTree');
          }
          // This safe has a top hat, so we prepare a proposal to edit the hats that have changed.
          proposalData = prepareEditHatsProposalData(
            values.proposalMetadata,
            editedHatStructs,
            hatsTree.adminHat.id,
            hatsTree.topHat.smartAddress,
            hatsTree.roleHatsTotalCount,
            hatsProtocol,
          );
        }

        // All done, submit the proposal!
        await submitProposal({
          proposalData,
          nonce: values.customNonce ?? safe.nextNonce,
          pendingToastMessage: t('proposalCreatePendingToastMessage', { ns: 'proposal' }),
          successToastMessage: t('proposalCreateSuccessToastMessage', { ns: 'proposal' }),
          failedToastMessage: t('proposalCreateFailureToastMessage', { ns: 'proposal' }),
          successCallback: submitProposalSuccessCallback,
        });
      } catch (e) {
        console.error(e);
        toast(t('encodingFailedMessage', { ns: 'proposal' }));
      } finally {
        formikHelpers.setSubmitting(false);
      }
    },
    [
      daoName,
      decentHatsMasterCopy,
      erc6551Registry,
      getHat,
      hatsAccount1ofNMasterCopy,
      hatsProtocol,
      hatsTree,
      hatsTreeId,
      ipfsClient,
      keyValuePairs,
      safe,
      submitProposal,
      submitProposalSuccessCallback,
      t,
    ],
  );

  const initialValues: RoleFormValues = useMemo(() => {
    const hats = hatsTree?.roleHats || [];
    return {
      proposalMetadata: {
        title: '',
        description: '',
      },
      hats,
      customNonce: safe?.nextNonce || 0,
    };
  }, [hatsTree?.roleHats, safe?.nextNonce]);

  if (daoAddress === null) return null;

  const showRoleEditDetails = (hatId: Hex) => {
    navigate(DAO_ROUTES.rolesEditDetails.relative(addressPrefix, daoAddress, hatId));
  };

  const hatsTreeLoading = hatsTree === undefined;
  const showNoRolesCard = !hatsTreeLoading && (hatsTree === null || hatsTree.roleHats.length === 0);

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
              {showNoRolesCard && values.hats.length === 0 && <RoleCardNoRoles />}
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
              onClick={() =>
                navigate(DAO_ROUTES.roles.relative(addressPrefix, daoAddress), { replace: true })
              }
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
