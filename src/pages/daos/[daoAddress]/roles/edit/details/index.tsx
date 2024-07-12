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
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Hex, isHex } from 'viem';
import RoleFormTabs from '../../../../../../components/pages/Roles/forms/RoleFormTabs';
import {
  EditBadgeStatus,
  EditedRole,
  RoleFormValues,
} from '../../../../../../components/pages/Roles/types';
import {
  CARD_SHADOW,
  NEUTRAL_2_82_TRANSPARENT,
  useHeaderHeight,
} from '../../../../../../constants/common';
import { DAO_ROUTES } from '../../../../../../constants/routes';
import { useFractal } from '../../../../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../../../../providers/NetworkConfig/NetworkConfigProvider';

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
    setFieldValue('editingRole', undefined);
    onRemove();
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
  const [searchParams] = useSearchParams();
  const hatEditingId = searchParams.get('hatId');
  if (!isHex(hatEditingId)) return null;
  if (!daoAddress) return null;
  if (hatEditingId === undefined) return null;

  return (
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
                  <Flex
                    gap="0.5rem"
                    alignItems="center"
                    aria-label={t('editRoles')}
                    onClick={() => {
                      navigate(DAO_ROUTES.rolesEdit.relative(addressPrefix, daoAddress));
                    }}
                  >
                    <Icon
                      as={ArrowLeft}
                      boxSize="1.5rem"
                    />
                    <Text textStyle="display-lg">{t('editRoles')}</Text>
                  </Flex>
                  <Box position="relative">
                    <EditRoleMenu
                      onRemove={() => {
                        navigate(DAO_ROUTES.rolesEdit.relative(addressPrefix, daoAddress));
                      }}
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
              onClose={() => {
                navigate(DAO_ROUTES.rolesEdit.relative(addressPrefix, daoAddress));
              }}
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
                        as={X}
                        onClick={() => {
                          navigate(DAO_ROUTES.rolesEdit.relative(addressPrefix, daoAddress));
                        }}
                      />
                      <Text
                        textStyle="body-base"
                        color="white-0"
                      >
                        {t('editRole')}
                      </Text>
                    </Flex>
                    <Box position="relative">
                      <EditRoleMenu
                        hatId={hatEditingId}
                        onRemove={() => {
                          navigate(DAO_ROUTES.rolesEdit.relative(addressPrefix, daoAddress));
                        }}
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
  );
}
