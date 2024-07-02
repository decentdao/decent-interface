import { Box, Flex, Icon, Portal, Show, Text } from '@chakra-ui/react';
import { ArrowLeft, Plus } from '@phosphor-icons/react';
import { FieldArray, Form, Formik } from 'formik';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Address, encodeFunctionData, zeroAddress } from 'viem';
import DecentHatsAbi from '../../../../../assets/abi/DecentHats';
import GnosisSafeL2 from '../../../../../assets/abi/GnosisSafeL2';
import { RoleCard } from '../../../../../components/pages/Roles/RoleCard';
import { RolesTable } from '../../../../../components/pages/Roles/RolesTable';
import RoleFormCreateProposal from '../../../../../components/pages/Roles/forms/RoleFormCreateProposal';
import RoleForm from '../../../../../components/pages/Roles/forms/RoleFormTabs';
import {
  RoleFormValues,
  DEFAULT_ROLE_HAT,
  HatStruct,
  RoleValue,
  EditBadgeStatus,
} from '../../../../../components/pages/Roles/types';
import { Card } from '../../../../../components/ui/cards/Card';
import { BarLoader } from '../../../../../components/ui/loaders/BarLoader';
import PageHeader from '../../../../../components/ui/page/Header/PageHeader';
import { useHeaderHeight } from '../../../../../constants/common';
import { DAO_ROUTES } from '../../../../../constants/routes';
import useSubmitProposal from '../../../../../hooks/DAO/proposal/useSubmitProposal';
import { useRolesSchema } from '../../../../../hooks/schemas/roles/useRolesSchema';
import { useFractal } from '../../../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../../../providers/NetworkConfig/NetworkConfigProvider';
import { useRolesState } from '../../../../../state/useRolesState';
import { CreateProposalMetadata } from '../../../../../types';

function RolesEdit() {
  const { t } = useTranslation(['roles', 'navigation', 'breadcrumbs', 'dashboard']);
  const {
    node: { daoAddress, safe },
  } = useFractal();
  const { addressPrefix } = useNetworkConfig();

  const [hatIndex, setHatIndex] = useState<number>();
  const [isSummaryOpen, setIsSummaryOpen] = useState(true);
  const { rolesSchema } = useRolesSchema();
  const { hatsTree, hatsTreeId } = useRolesState();

  const { submitProposal } = useSubmitProposal();

  const hats = useMemo(() => {
    // @todo get hats from hatsTree from state
    // @todo will need to combine with Sablier information, down the road.
    return [
      {
        id: 1,
        member: zeroAddress,
        roleName: 'Legal Reviewer',
        roleDescription: 'The Legal Reviewer role has...',
      },
      {
        id: 2,
        member: zeroAddress,
        roleName: 'Marketer',
        roleDescription: 'The Marketer role has...',
      },
      {
        id: 3,
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

  const decentHatsAddress = '0x88e72194d93bf417310b197275d972cf78406163'; // @todo: sepolia only. Move to, and read from, network config

  const prepareCreateHatProposal = useCallback(
    async (proposalMetadata: CreateProposalMetadata, addedHats: HatStruct[]) => {
      if (!safe) return;

      const enableModuleData = encodeFunctionData({
        abi: GnosisSafeL2,
        functionName: 'enableModule',
        args: [decentHatsAddress],
      });

      const disableModuleData = encodeFunctionData({
        abi: GnosisSafeL2,
        functionName: 'disableModule',
        args: [decentHatsAddress, decentHatsAddress], // @todo: Figure out prevModule arg. Need to retrieve from safe.
      });

      const addressZero = zeroAddress as Address;
      const adminHat: HatStruct = {
        eligibility: addressZero,
        toggle: addressZero,
        maxSupply: 1,
        details: JSON.stringify({
          name: 'Admin',
          description: '',
        }),
        imageURI: '',
        isMutable: true,
        wearer: addressZero,
      };

      const createAndDeclareTreeData = encodeFunctionData({
        abi: DecentHatsAbi,
        functionName: 'createAndDeclareTree',
        args: [
          JSON.stringify({
            name: 'Top Hat',
            description: 'top hat',
          }),
          '',
          adminHat,
          addedHats,
        ],
      });

      return {
        targets: [safe.address, decentHatsAddress, safe.address] as Address[],
        calldatas: [enableModuleData, createAndDeclareTreeData, disableModuleData],
        metaData: proposalMetadata,
        values: [0n, 0n, 0n],
      };
    },
    [safe],
  );

  const parsedEditedHats = (editedHats: RoleValue[]) => {
    const addedHats: HatStruct[] = [];
    
    editedHats.forEach(hat => {
      const { roleName, member, roleDescription, editedRole } = hat;
      if (editedRole) {
        if (editedRole.status === EditBadgeStatus.New) {
          addedHats.push({
            eligibility: zeroAddress,
            toggle: zeroAddress,
            maxSupply: 1,
            details: JSON.stringify({
              name: roleName,
              description: roleDescription,
            }),
            imageURI: '',
            isMutable: true,
            wearer: member as Address,
          });
        }
      }
    });

    return addedHats;
  };

  const setupAndCreateRolesEditProposal = useCallback(
    async (values: RoleFormValues) => {
      // filter to hats that have been modified (includes editedRole prop)
      const modifiedHats = values.hats.filter(hat => !!hat.editedRole);

      // if hatsTreeId is not set:
      //  - add decent hats module to this safe
      //  - call createAndDeclareTree on decent hats module:
      //   - create a new top hat
      //   - under that an admin hat
      // else:
      //  - assert no changes to either top hat or admin hat
      //  - for each modified hat:
      //   - check type of edit
      //   - build hats tx for that edit

      try {
        const proposalData = await prepareCreateHatProposal(
          values.proposalMetadata,
          parsedEditedHats(modifiedHats),
        );

        if (proposalData) {
          submitProposal({
            proposalData,
            nonce: safe?.nextNonce,
            pendingToastMessage: t('proposalCreatePendingToastMessage', { ns: 'proposal' }),
            successToastMessage: t('proposalCreateSuccessToastMessage', { ns: 'proposal' }),
            failedToastMessage: t('proposalCreateFailureToastMessage', { ns: 'proposal' }),
            // successCallback,
          });
        }

        console.log('values', values);
        console.log('proposalData', proposalData);
      } catch (e) {
        console.error(e);
        // toast(t('encodingFailedMessage', { ns: 'proposal' }));
      }
    },
    [safe, prepareCreateHatProposal, submitProposal, t],
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
      onSubmit={setupAndCreateRolesEditProposal}
    >
      {({ handleSubmit, values }) => (
        <Form onSubmit={handleSubmit}>
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
                    handleSubmit();
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
                  <RolesTable
                    mode="edit"
                    handleRoleClick={handleRoleClick}
                  />
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

                        <RoleForm
                          hatIndex={hatIndex}
                          existingRoleHat={hats.find(hat => hat.id === values.hats[hatIndex].id)}
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
                              aria-label={t('editRoles')}
                              onClick={() => {
                                // remove(hatIndex);
                                // setHatIndex(undefined);
                              }}
                            >
                              <Icon
                                as={ArrowLeft}
                                boxSize="1.5rem"
                              />
                              <Text textStyle="display-lg">{t('editRoles')}</Text>
                            </Flex>
                          </Flex>
                          <RoleFormCreateProposal />
                        </Box>
                      </Portal>
                    </Box>
                  )}
                  {values.hats.map((hat, index) => (
                    <RoleCard
                      key={index}
                      hatId={hat.id}
                      roleName={hat.roleName}
                      wearerAddress={hat.member}
                      mode="edit"
                      handleRoleClick={() => handleRoleClick(index)}
                    />
                  ))}
                </Show>
              </Box>
            )}
          </FieldArray>
        </Form>
      )}
    </Formik>
  );
}

export default RolesEdit;
