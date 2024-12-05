import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerOverlay,
  Flex,
  Hide,
  Icon,
  IconButton,
  Portal,
  Show,
  Text,
} from '@chakra-ui/react';
import { ArrowLeft, DotsThree, Trash } from '@phosphor-icons/react';
import { FieldArray, useFormikContext } from 'formik';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Hex, isHex } from 'viem';
import { RoleFormTabs } from '../../../../../components/Roles/forms/RoleFormTabs';
import DraggableDrawer from '../../../../../components/ui/containers/DraggableDrawer';
import { ModalBase } from '../../../../../components/ui/modals/ModalBase';
import { UnsavedChangesWarningContent } from '../../../../../components/ui/modals/UnsavedChangesWarningContent';
import {
  BACKGROUND_SEMI_TRANSPARENT,
  CARD_SHADOW,
  NEUTRAL_2_82_TRANSPARENT,
  useHeaderHeight,
} from '../../../../../constants/common';
import { DAO_ROUTES } from '../../../../../constants/routes';
import { useNavigationBlocker } from '../../../../../hooks/utils/useNavigationBlocker';
import { useNetworkConfigStore } from '../../../../../providers/NetworkConfig/useNetworkConfigStore';
import { useDaoInfoStore } from '../../../../../store/daoInfo/useDaoInfoStore';
import { useRolesStore } from '../../../../../store/roles/useRolesStore';
import {
  EditBadgeStatus,
  EditedRole,
  RoleFormValues,
  RoleHatFormValue,
} from '../../../../../types/roles';

function EditRoleMenu({ onRemove, hatId }: { hatId: Hex; onRemove: () => void }) {
  const { t } = useTranslation(['roles']);
  const { values, setFieldValue } = useFormikContext<RoleFormValues>();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const hatIndex = values.hats.findIndex(h => h.id === hatId);
  const role = values.hats[hatIndex];

  const handleRemoveRole = () => {
    const editedRole: EditedRole = {
      fieldNames: [],
      status: EditBadgeStatus.Removed,
    };

    if (hatIndex !== -1) {
      if (role?.editedRole?.status === EditBadgeStatus.New) {
        setFieldValue(
          'hats',
          values.hats.filter(h => h.id !== hatId),
        );
      } else {
        setFieldValue(`hats.${hatIndex}`, { ...values.hats[hatIndex], editedRole });
      }
    }

    setFieldValue('roleEditing', undefined);
    setFieldValue('newRoleTerm', undefined);
    setTimeout(() => onRemove(), 50);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      <IconButton
        aria-label="edit role menu"
        variant="tertiary"
        h="fit-content"
        size="lg"
        as={DotsThree}
        onClick={() => setShowMenu(show => !show)}
      />
      {showMenu && (
        <Box
          position="absolute"
          ref={menuRef}
          right="0%"
          minW="15.25rem"
          rounded="0.5rem"
          bg={NEUTRAL_2_82_TRANSPARENT}
          border="1px solid"
          borderColor="neutral-3"
          boxShadow={CARD_SHADOW}
          zIndex={10000}
        >
          <Button
            variant="unstyled"
            color="red-1"
            _hover={{ bg: 'neutral-2' }}
            onClick={handleRemoveRole}
            rightIcon={
              <Icon
                as={Trash}
                boxSize="1.5rem"
              />
            }
            minW="full"
            justifyContent="space-between"
          >
            {t('deleteRole')}
          </Button>
        </Box>
      )}
    </>
  );
}

export function SafeRoleEditDetailsPage() {
  const headerHeight = useHeaderHeight();
  const { t } = useTranslation(['roles']);
  const { safe } = useDaoInfoStore();
  const { getPayment } = useRolesStore();
  const { addressPrefix } = useNetworkConfigStore();
  const navigate = useNavigate();
  const { values, setFieldValue, touched, setTouched } = useFormikContext<RoleFormValues>();
  const [searchParams] = useSearchParams();
  const hatEditingId = searchParams.get('hatId');

  const [wasRoleActuallyEdited, setWasRoleActuallyEdited] = useState(false);

  const editRolesFormikContext = useFormikContext<RoleFormValues>();
  const blocker = useNavigationBlocker({
    roleEditDetailsNavigationBlockerParams: { wasRoleActuallyEdited, ...editRolesFormikContext },
  });

  const backupRoleEditing = useRef(values.roleEditing);
  const backupTouched = useRef(touched.roleEditing);
  const backupNewRoleTerm = useRef(values.newRoleTerm);

  if (!isHex(hatEditingId)) return null;
  if (!safe?.address) return null;
  if (hatEditingId === undefined) return null;

  const goBackToRolesEdit = () => {
    backupRoleEditing.current = values.roleEditing;
    backupTouched.current = touched.roleEditing;
    backupNewRoleTerm.current = values.newRoleTerm;

    setWasRoleActuallyEdited(values.roleEditing !== undefined);

    setTimeout(() => {
      setTouched({});
      setFieldValue('roleEditing', undefined);
      setFieldValue('newRoleTerm', undefined);
      navigate(DAO_ROUTES.rolesEdit.relative(addressPrefix, safe.address), { replace: true });
    }, 50);
  };

  const paymentIndex = values.roleEditing?.roleEditingPaymentIndex;
  const streamId =
    paymentIndex !== undefined ? values.roleEditing?.payments?.[paymentIndex]?.streamId : undefined;

  const goBackToRoleEdit = () => {
    if (!values.roleEditing?.payments || paymentIndex === undefined || !hatEditingId) return;
    const isExistingPayment = !!streamId ? getPayment(hatEditingId, streamId) : undefined;
    // if payment is new, and unedited, remove it
    if (
      paymentIndex === values.roleEditing.payments.length - 1 &&
      !values.roleEditing.editedRole &&
      !isExistingPayment
    ) {
      setFieldValue(
        'roleEditing.payments',
        values.roleEditing.payments.filter((_, index) => index !== paymentIndex),
      );
    }
    setFieldValue('newRoleTerm', undefined);
    setFieldValue('roleEditing.roleEditingPaymentIndex', undefined);
  };

  const goBackText = t(
    paymentIndex === undefined ? 'editRole' : streamId ? 'payments' : 'addPayment',
  );

  return (
    <>
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
                onKeepEditing={() => {
                  setFieldValue('roleEditing', backupRoleEditing.current);
                  setFieldValue('newRoleTerm', backupNewRoleTerm.current);
                  setTouched({ roleEditing: backupTouched.current });
                  blocker.reset();
                }}
              />
            </DraggableDrawer>
          </Hide>
          <Hide below="md">
            <ModalBase
              isOpen
              onClose={() => {}}
            >
              <UnsavedChangesWarningContent
                onDiscard={blocker.proceed}
                onKeepEditing={() => {
                  setFieldValue('roleEditing', backupRoleEditing.current);
                  setFieldValue('newRoleTerm', backupNewRoleTerm.current);
                  setTouched({ roleEditing: backupTouched.current });
                  blocker.reset();
                }}
              />
            </ModalBase>
          </Hide>
        </>
      )}
      <FieldArray name="hats">
        {({ push }: { push: (roleHatFormValue: RoleHatFormValue) => void }) => (
          <>
            <Show below="md">
              <Portal>
                <Box
                  position="fixed"
                  top={0}
                  h="100vh"
                  w="full"
                  bg="neutral-1"
                  px="1rem"
                  pt={headerHeight}
                  overflow="scroll"
                >
                  <Flex
                    justifyContent="space-between"
                    alignItems="center"
                    my="1.75rem"
                  >
                    <Button
                      variant="tertiary"
                      gap="0.5rem"
                      alignItems="center"
                      aria-label={goBackText}
                      onClick={paymentIndex === undefined ? goBackToRolesEdit : goBackToRoleEdit}
                      color="neutral-8"
                    >
                      <Icon
                        as={ArrowLeft}
                        boxSize="1.5rem"
                      />
                      <Text textStyle="heading-small">{goBackText}</Text>
                    </Button>
                    {paymentIndex === undefined && (
                      <Box position="relative">
                        <EditRoleMenu
                          hatId={hatEditingId}
                          onRemove={goBackToRolesEdit}
                        />
                      </Box>
                    )}
                  </Flex>
                  <Box pb="5rem">
                    <RoleFormTabs
                      hatId={hatEditingId}
                      pushRole={push}
                      blocker={blocker}
                    />
                  </Box>
                </Box>
              </Portal>
            </Show>
            <Show above="md">
              <Drawer
                isOpen
                placement="right"
                onClose={goBackToRolesEdit}
              >
                <DrawerOverlay
                  bg={BACKGROUND_SEMI_TRANSPARENT}
                  backdropFilter="auto"
                  backdropBlur="10px"
                />
                <DrawerContent
                  minW="50%"
                  bg="neutral-2"
                  pt="1rem"
                >
                  <DrawerBody h="100vh">
                    <Flex
                      justifyContent="space-between"
                      my="1rem"
                    >
                      <Flex
                        gap="1rem"
                        alignItems="center"
                      >
                        <IconButton
                          variant="tertiary"
                          size="icon-sm"
                          aria-label={goBackText}
                          icon={<ArrowLeft size="1.5rem" />}
                          onClick={
                            paymentIndex === undefined ? goBackToRolesEdit : goBackToRoleEdit
                          }
                        />
                        <Text color="neutral-8">{goBackText}</Text>
                      </Flex>
                      {paymentIndex === undefined && (
                        <Box position="relative">
                          <EditRoleMenu
                            hatId={hatEditingId}
                            onRemove={goBackToRolesEdit}
                          />
                        </Box>
                      )}
                    </Flex>
                    <RoleFormTabs
                      hatId={hatEditingId}
                      pushRole={push}
                      blocker={blocker}
                    />
                  </DrawerBody>
                </DrawerContent>
              </Drawer>
            </Show>
          </>
        )}
      </FieldArray>
    </>
  );
}
