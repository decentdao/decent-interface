import { Box, Button, Flex, Icon, Portal, Show, Text } from '@chakra-ui/react';
import { ArrowLeft, Plus } from '@phosphor-icons/react';
import { FieldArray, Formik } from 'formik';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getAddress, zeroAddress } from 'viem';
import { RoleCardEdit } from '../../../../../components/pages/Roles/RoleCard';
import { RolesEditTable } from '../../../../../components/pages/Roles/RolesTable';
import RoleFormCreateProposal from '../../../../../components/pages/Roles/forms/RoleFormCreateProposal';
import RoleFormTabs from '../../../../../components/pages/Roles/forms/RoleFormTabs';
import { RoleFormValues, DEFAULT_ROLE_HAT } from '../../../../../components/pages/Roles/types';
import { Card } from '../../../../../components/ui/cards/Card';
import { BarLoader } from '../../../../../components/ui/loaders/BarLoader';
import PageHeader from '../../../../../components/ui/page/Header/PageHeader';
import { useHeaderHeight } from '../../../../../constants/common';
import { DAO_ROUTES } from '../../../../../constants/routes';
import useSubmitProposal from '../../../../../hooks/DAO/proposal/useSubmitProposal';
import { useRolesSchema } from '../../../../../hooks/schemas/roles/useRolesSchema';
import {
  parsedEditedHatsFormValues,
  prepareCreateTopHatProposalData,
  prepareEditHatsProposalData,
} from '../../../../../hooks/utils/rolesProposalFunctions';
import { useFractal } from '../../../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../../../providers/NetworkConfig/NetworkConfigProvider';
import { useRolesState } from '../../../../../state/useRolesState';
import { ProposalExecuteData } from '../../../../../types';

function RolesEdit() {
  const { t } = useTranslation(['roles', 'navigation', 'modals', 'breadcrumbs', 'common']);
  const {
    node: { daoAddress, safe },
  } = useFractal();
  const { addressPrefix } = useNetworkConfig();

  const [hatIndex, setHatIndex] = useState<number>();
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const { rolesSchema } = useRolesSchema();
  const navigate = useNavigate();
  const { hatsTree, hatsTreeId } = useRolesState();

  const { submitProposal } = useSubmitProposal();

  const hats = useMemo(() => {
    // @todo get hats from hatsTree from state
    // @todo will need to combine with Sablier information, down the road.
    return [
      {
        id: 1n,
        member: zeroAddress,
        roleName: 'Legal Reviewer',
        roleDescription: 'The Legal Reviewer role has...',
      },
      {
        id: 2n,
        member: zeroAddress,
        roleName: 'Marketer',
        roleDescription: 'The Marketer role has...',
      },
      {
        id: 3n,
        member: zeroAddress,
        roleName: 'Developer',
        roleDescription: 'The Developer role has...',
      },
    ];
  }, []);

  const headerHeight = useHeaderHeight();

  const handleRoleClick = (_hatIndex: number) => {
    setHatIndex(_hatIndex);
  };

  const createRolesEditProposal = useCallback(
    async (values: RoleFormValues) => {
      if (!safe) {
        throw new Error('Cannot create Roles proposal without known Safe');
      }

      try {
        // filter to hats that have been modified (ie includes `editedRole` prop)
        const modifiedHats = values.hats.filter(hat => !!hat.editedRole);

        let proposalData: ProposalExecuteData;

        const editedHatStructs = parsedEditedHatsFormValues(modifiedHats);

        if (hatsTreeId === null || hatsTreeId === undefined) {
          // This safe has no top hat, so we prepare a proposal to create one. This will also create an admin hat,
          // along with any other hats that are added.
          proposalData = await prepareCreateTopHatProposalData(
            values.proposalMetadata,
            editedHatStructs.addedHats,
            getAddress(safe.address),
          );
        } else {
          if (hatsTree === undefined || hatsTree === null) {
            throw new Error('Cannot edit Roles without a HatsTree');
          }

          // @todo: confirm these are accurate
          const adminHatId = hatsTree.adminHat.id;
          const hatsCount = hatsTree.roleHats.length;

          // This safe has a top hat, so we prepare a proposal to edit the hats that have changed.
          proposalData = await prepareEditHatsProposalData(
            values.proposalMetadata,
            editedHatStructs,
            BigInt(hatsTreeId),
            BigInt(adminHatId), // @todo: confirm adminHatId type -- it's an Address. Is that right?
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
          // successCallback,
        });

        console.log('proposalData', proposalData);
      } catch (e) {
        console.error(e);
        toast(t('encodingFailedMessage', { ns: 'proposal' }));
      }
    },
    [safe, hatsTree, hatsTreeId, submitProposal, t],
  );

  if (daoAddress === null) return null;

  return (
    <Formik<RoleFormValues>
      initialValues={{
        proposalMetadata: {
          title: '',
          description: '',
        },
        hats,
      }}
      validationSchema={rolesSchema}
      validateOnMount
      onSubmit={createRolesEditProposal}
    >
      {({ handleSubmit, values }) => (
        <form onSubmit={handleSubmit}>
          <FieldArray name="hats">
            {({ push, remove }) => (
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
                    push(DEFAULT_ROLE_HAT);
                    setHatIndex(values.hats.length);
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
                  <RolesEditTable handleRoleClick={handleRoleClick} />
                </Show>
                <Show below="md">
                  {!!hatIndex && (
                    <Portal>
                      <Box
                        position="fixed"
                        top={headerHeight}
                        h={`100vh`}
                        w="full"
                        bg="neutral-1"
                        px="1rem"
                      >
                        <Flex
                          justifyContent="space-between"
                          alignItems="center"
                          my="1.75rem"
                        >
                          <Flex
                            gap="0.5rem"
                            alignItems="center"
                            aria-label={t('editRoles')}
                            onClick={() => {
                              remove(hatIndex);
                              setHatIndex(undefined);
                            }}
                          >
                            <Icon
                              as={ArrowLeft}
                              boxSize="1.5rem"
                            />
                            <Text textStyle="display-lg">{t('editRoles')}</Text>
                          </Flex>
                        </Flex>

                        <RoleFormTabs
                          hatIndex={hatIndex}
                          existingRoleHat={hats.find(hat => hat.id === values.hats[hatIndex].id)}
                          close={() => setHatIndex(undefined)}
                        />
                      </Box>
                    </Portal>
                  )}
                  {isSummaryOpen && (
                    <Box>
                      <Portal>
                        <Box
                          position="fixed"
                          top={headerHeight}
                          h={`100vh`}
                          w="full"
                          bg="neutral-1"
                          px="1rem"
                        >
                          <Flex
                            justifyContent="space-between"
                            alignItems="center"
                            my="1.75rem"
                          >
                            <Flex
                              gap="0.5rem"
                              alignItems="center"
                              aria-label={t('proposalNew')}
                              onClick={() => {
                                setIsSummaryOpen(false);
                              }}
                            >
                              <Icon
                                as={ArrowLeft}
                                boxSize="1.5rem"
                              />
                              <Text textStyle="display-lg">
                                {t('proposalNew', { ns: 'breadcrumbs' })}
                              </Text>
                            </Flex>
                          </Flex>
                          <RoleFormCreateProposal close={() => setIsSummaryOpen(false)} />
                        </Box>
                      </Portal>
                    </Box>
                  )}
                  {values.hats.map((hat, index) => (
                    <RoleCardEdit
                      key={index}
                      roleName={hat.roleName}
                      wearerAddress={hat.member}
                      handleRoleClick={() => handleRoleClick(index)}
                    />
                  ))}
                </Show>
              </Box>
            )}
          </FieldArray>
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
              onClick={() => setIsSummaryOpen(true)}
              isDisabled={!values.hats.some(hat => hat.editedRole)}
            >
              {t('createProposal', { ns: 'modals' })}
            </Button>
          </Flex>
        </form>
      )}
    </Formik>
  );
}

export default RolesEdit;
