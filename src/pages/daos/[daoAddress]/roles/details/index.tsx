import { Show, Flex, Icon, IconButton, Text, Box } from '@chakra-ui/react';
import { PencilLine } from '@phosphor-icons/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AvatarAndRoleName } from '../../../../../components/pages/Roles/RoleCard';
import DraggableDrawer from '../../../../../components/ui/containers/DraggableDrawer';
import { DAO_ROUTES } from '../../../../../constants/routes';
import { useFractal } from '../../../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../../../providers/NetworkConfig/NetworkConfigProvider';
import { useRolesState } from '../../../../../state/useRolesState';
import PayrollAndVesting from './PayrollAndVesting';

export default function RoleDetails() {
  const [open, setOpen] = useState(true);
  const {
    node: { daoAddress },
  } = useFractal();
  const { t } = useTranslation('roles');
  const { hatsTree } = useRolesState();
  const { addressPrefix } = useNetworkConfig();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  if (!daoAddress) return null;
  const hatIndex = searchParams.get('hatIndex')
    ? parseInt(searchParams.get('hatIndex') as string)
    : -1;
  const hat = hatsTree?.roleHats[hatIndex];
  if (!hat) return null;

  const handleEditRoleClick = () => {
    navigate(DAO_ROUTES.rolesEditDetails.relative(addressPrefix, daoAddress, hatIndex));
    setOpen(false);
  };

  const handleDrawerClose = () => {
    navigate(DAO_ROUTES.roles.relative(addressPrefix, daoAddress));
    setOpen(false);
  };

  return (
    <>
      <Show below="md">
        <DraggableDrawer
          isOpen={open}
          onOpen={() => setOpen(true)}
          onClose={handleDrawerClose}
          headerContent={
            <Flex
              justifyContent="space-between"
              mx="-0.5rem"
            >
              <AvatarAndRoleName
                wearerAddress={hat.wearer}
                name={hat.name}
              />
              <Flex
                alignItems="center"
                gap="1rem"
              >
                <IconButton
                  variant="tertiary"
                  aria-label="Edit Role"
                  onClick={handleEditRoleClick}
                  size="icon-sm"
                  icon={
                    <Icon
                      as={PencilLine}
                      color="lilac-0"
                      aria-hidden
                      weight="fill"
                    />
                  }
                />
              </Flex>
            </Flex>
          }
        >
          <Box
            px="1rem"
            mb="1rem"
          >
            <Text
              color="neutral-7"
              textStyle="button-small"
            >
              {t('roleDescription')}
            </Text>
            <Text textStyle="body-base">{hat.description}</Text>
          </Box>
          <Box
            px="1rem"
            mb="1.5rem"
          >
            <PayrollAndVesting />
          </Box>
        </DraggableDrawer>
      </Show>
      <Show above="md">{/* @todo - show hat details side modal */}</Show>
    </>
  );
}
