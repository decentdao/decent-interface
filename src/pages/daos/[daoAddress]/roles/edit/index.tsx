import { Box, Button, Flex, Show, Text } from '@chakra-ui/react';
import { Plus } from '@phosphor-icons/react';
import { Formik } from 'formik';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getAddress } from 'viem';
import { RoleCardEdit } from '../../../../../components/pages/Roles/RoleCard';
import { RolesEditTable } from '../../../../../components/pages/Roles/RolesTable';
import { RoleFormValues, DEFAULT_ROLE_HAT } from '../../../../../components/pages/Roles/types';
import { Card } from '../../../../../components/ui/cards/Card';
import { BarLoader } from '../../../../../components/ui/loaders/BarLoader';
import PageHeader from '../../../../../components/ui/page/Header/PageHeader';
import { DAO_ROUTES } from '../../../../../constants/routes';
import useSubmitProposal from '../../../../../hooks/DAO/proposal/useSubmitProposal';
import { useRolesSchema } from '../../../../../hooks/schemas/roles/useRolesSchema';
import {
  parsedEditedHatsFormValues,
  prepareCreateTopHatProposalData,
  prepareEditHatsProposalData,
} from '../../../../../hooks/utils/rolesProposalFunctions';
import { useFractal } from '../../../../../providers/App/AppProvider';
import useIPFSClient from '../../../../../providers/App/hooks/useIPFSClient';
import { useNetworkConfig } from '../../../../../providers/NetworkConfig/NetworkConfigProvider';
import { useRolesState } from '../../../../../state/useRolesState';
import { ProposalExecuteData } from '../../../../../types';

function RolesEdit() {
  const { t } = useTranslation(['roles', 'navigation', 'modals', 'breadcrumbs', 'common']);
  const {
    node: { daoAddress, safe, daoName },
  } = useFractal();
  const { addressPrefix } = useNetworkConfig();

  const { rolesSchema } = useRolesSchema();
  const { hatsTree, hatsTreeId, getHat } = useRolesState();

  console.log(hatsTree, hatsTreeId);
  const navigate = useNavigate();

  const { submitProposal } = useSubmitProposal();

  const ipfsClient = useIPFSClient();

  const submitProposalSuccessCallback = useCallback(() => {
    if (daoAddress) {
      navigate(DAO_ROUTES.proposals.relative(addressPrefix, daoAddress));
    }
  }, [daoAddress, addressPrefix, navigate]);

  const createRolesEditProposal = useCallback(
    async (values: RoleFormValues) => {
      if (!safe) {
        throw new Error('Cannot create Roles proposal without known Safe');
      }

      try {
        // filter to hats that have been modified (ie includes `editedRole` prop)
        const modifiedHats = values.hats.filter(hat => !!hat.editedRole);

        let proposalData: ProposalExecuteData;

        const uploadHatDescriptionCallback = async (hatDescription: string) =>
          `ipfs://${(await ipfsClient.add(hatDescription)).Hash}`;

        const editedHatStructs = await parsedEditedHatsFormValues(
          modifiedHats,
          getHat,
          uploadHatDescriptionCallback,
        );

        console.log(editedHatStructs.addedHats);

        if (hatsTreeId === null || hatsTreeId === undefined) {
          // This safe has no top hat, so we prepare a proposal to create one. This will also create an admin hat,
          // along with any other hats that are added.
          proposalData = await prepareCreateTopHatProposalData(
            values.proposalMetadata,
            editedHatStructs.addedHats,
            getAddress(safe.address),
            uploadHatDescriptionCallback,
            daoName ?? safe.address,
          );
        } else {
          if (hatsTree === undefined || hatsTree === null) {
            throw new Error('Cannot edit Roles without a HatsTree');
          }

          const adminHatId = hatsTree.adminHat.id;
          console.log(hatsTree.adminHat.id);
          const hatsCount = hatsTree.roleHatsTotalCount;

          // This safe has a top hat, so we prepare a proposal to edit the hats that have changed.
          proposalData = await prepareEditHatsProposalData(
            values.proposalMetadata,
            editedHatStructs,
            hatsTreeId,
            BigInt(adminHatId),
            hatsCount,
          );
        }

        // All done, submit the proposal!
        submitProposal({
          proposalData,
          nonce: safe.nextNonce,
          pendingToastMessage: t('proposalCreatePendingToastMessage', { ns: 'proposal' }),
          successToastMessage: t('proposalCreateSuccessToastMessage', { ns: 'proposal' }),
          failedToastMessage: t('proposalCreateFailureToastMessage', { ns: 'proposal' }),
          successCallback: submitProposalSuccessCallback,
        });
      } catch (e) {
        console.error(e);
        toast(t('encodingFailedMessage', { ns: 'proposal' }));
      }
    },
    [
      safe,
      daoName,
      getHat,
      hatsTreeId,
      submitProposal,
      t,
      ipfsClient,
      hatsTree,
      submitProposalSuccessCallback,
    ],
  );

  const initialValues = useMemo(() => {
    return {
      proposalMetadata: {
        title: '',
        description: '',
      },
      hats: hatsTree?.roleHats || [],
    };
  }, [hatsTree?.roleHats]);

  if (daoAddress === null) return null;

  const showRoleEditDetails = (_hatIndex: number) => {
    navigate(DAO_ROUTES.rolesEditDetails.relative(addressPrefix, daoAddress, _hatIndex));
  };

  return (
    <Formik<RoleFormValues>
      initialValues={initialValues}
      enableReinitialize
      validationSchema={rolesSchema}
      validateOnMount
      onSubmit={createRolesEditProposal}
    >
      {({ handleSubmit, values, setFieldValue }) => (
        <form onSubmit={handleSubmit}>
          <Box>
            <PageHeader
              title={t('roles')}
              breadcrumbs={[
                {
                  terminus: t('roles', {
                    ns: 'roles',
                  }),
                  path: DAO_ROUTES.roles.relative(addressPrefix, daoAddress),
                },
                {
                  terminus: t('editRoles', {
                    ns: 'roles',
                  }),
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
                setFieldValue('roleEditing', DEFAULT_ROLE_HAT);
                showRoleEditDetails(values.hats.length);
              }}
            />
            {hatsTree === undefined && (
              <Card
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <BarLoader />
              </Card>
            )}
            {hatsTree === null && (
              <Card my="0.5rem">
                <Text
                  textStyle="body-base"
                  textAlign="center"
                  color="white-alpha-16"
                >
                  {t('noRoles')}
                </Text>
              </Card>
            )}

            <Show above="md">
              <RolesEditTable handleRoleClick={showRoleEditDetails} />
            </Show>
            <Show below="md">
              {values.hats &&
                values.hats.map((hat, index) => (
                  <RoleCardEdit
                    key={index}
                    name={hat.name}
                    wearerAddress={hat.wearer}
                    editStatus={hat.editedRole?.status}
                    handleRoleClick={() => {
                      setFieldValue('roleEditing', hat);
                      showRoleEditDetails(index);
                    }}
                  />
                ))}
            </Show>
          </Box>
          <Flex
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
              onClick={() =>
                navigate(
                  DAO_ROUTES.rolesEditCreateProposalSummary.relative(addressPrefix, daoAddress),
                )
              }
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
