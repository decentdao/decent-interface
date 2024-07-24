import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  Flex,
  Icon,
  IconButton,
  Portal,
  Show,
  Text,
} from '@chakra-ui/react';
import { ArrowLeft, DotsThree, Trash, X } from '@phosphor-icons/react';
import { FieldArray, useFormikContext } from 'formik';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Blocker, useBlocker, useNavigate, useSearchParams } from 'react-router-dom';
import { Hex, isHex } from 'viem';
import RoleFormTabs from '../../../../../../components/pages/Roles/forms/RoleFormTabs';
import {
  EditBadgeStatus,
  EditedRole,
  RoleFormValues,
} from '../../../../../../components/pages/Roles/types';
import DraggableDrawer from '../../../../../../components/ui/containers/DraggableDrawer';
import {
  CARD_SHADOW,
  NEUTRAL_2_82_TRANSPARENT,
  useHeaderHeight,
} from '../../../../../../constants/common';
import { DAO_ROUTES } from '../../../../../../constants/routes';
import { useFractal } from '../../../../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../../../../providers/NetworkConfig/NetworkConfigProvider';
import { UnsavedChangesWarningContent } from '../unsavedChangesWarningContent';

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

export default function RoleEditDetails() {
  const headerHeight = useHeaderHeight();
  const { t } = useTranslation(['roles']);
  const {
    node: { daoAddress },
  } = useFractal();
  const { addressPrefix } = useNetworkConfig();
  const navigate = useNavigate();
  const { values, setFieldValue, touched, setTouched } = useFormikContext<RoleFormValues>();
  const [searchParams] = useSearchParams();
  const hatEditingId = searchParams.get('hatId');

  const blocker: Blocker = useBlocker(({ currentLocation, nextLocation }) => {
    return (
      !!values.roleEditing &&
      !!touched.roleEditing &&
      currentLocation.pathname !== nextLocation.pathname
    );
  });

  const backupRoleEditing = useRef(values.roleEditing);
  const backupTouched = useRef(touched.roleEditing);

  if (!isHex(hatEditingId)) return null;
  if (!daoAddress) return null;
  if (hatEditingId === undefined) return null;

  const goBackToRolesEdit = () => {
    backupRoleEditing.current = values.roleEditing;
    backupTouched.current = touched.roleEditing;

    setTouched({});
    setFieldValue('roleEditing', undefined);
    navigate(DAO_ROUTES.rolesEdit.relative(addressPrefix, daoAddress), { replace: true });
  };

  return (
    <>
      {blocker.state === 'blocked' && (
        // <Hide above="md">
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
              setTouched({ roleEditing: backupTouched.current });
              blocker.reset();
            }}
          />
        </DraggableDrawer>
        // </Hide>
      )}
      <FieldArray name="hats">
        {({ push }) => (
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
                      aria-label={t('editRoles')}
                      onClick={goBackToRolesEdit}
                    >
                      <Icon
                        as={ArrowLeft}
                        boxSize="1.5rem"
                      />
                      <Text textStyle="display-lg">{t('editRoles')}</Text>
                    </Button>
                    <Box position="relative">
                      <EditRoleMenu
                        onRemove={goBackToRolesEdit}
                        hatId={hatEditingId}
                      />
                    </Box>
                  </Flex>
                  <Box pb="5rem">
                    <RoleFormTabs
                      hatId={hatEditingId}
                      push={push}
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
                          aria-label="Close Drawer"
                          icon={<X size="1.5rem" />}
                          onClick={goBackToRolesEdit}
                        />
                        <Text textStyle="body-base">{t('editRole')}</Text>
                      </Flex>
                      <Box position="relative">
                        <EditRoleMenu
                          hatId={hatEditingId}
                          onRemove={goBackToRolesEdit}
                        />
                      </Box>
                    </Flex>
                    <RoleFormTabs
                      hatId={hatEditingId}
                      push={push}
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
