import { Flex, IconButton, Icon, Text, Box } from '@chakra-ui/react';
import { PencilLine } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { DAO_ROUTES } from '../../../constants/routes';
import PayrollAndVesting from '../../../pages/daos/[daoAddress]/roles/details/PayrollAndVesting';
import { useFractal } from '../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { DecentRoleHat, useRolesState } from '../../../state/useRolesState';
import DraggableDrawer from '../../ui/containers/DraggableDrawer';
import { AvatarAndRoleName } from './RoleCard';
import { SablierVesting, SablierPayroll } from './types';

export default function RolesDetailsDrawerMobile({
  roleHat,
}: {
  // @todo Update main typing to include these fields after implementation
  roleHat: DecentRoleHat & { vestingData?: SablierVesting; payrollData?: SablierPayroll };
}) {
  const {
    node: { daoAddress },
  } = useFractal();
  const { t } = useTranslation('roles');
  const { hatsTree } = useRolesState();
  const { addressPrefix } = useNetworkConfig();
  const navigate = useNavigate();

  if (!daoAddress || !hatsTree) return null;

  const handleEditRoleClick = () => {
    const hatIndex = hatsTree?.roleHats.findIndex(hat => hat.id === roleHat.id);
    if (!hatIndex) return;
    navigate(DAO_ROUTES.rolesEditDetails.relative(addressPrefix, daoAddress, hatIndex));
  };

  const handleDrawerClose = () => {
    navigate(DAO_ROUTES.roles.relative(addressPrefix, daoAddress));
  };
  return (
    <DraggableDrawer
      onClose={handleDrawerClose}
      onOpen={() => {}}
      isOpen={true}
      headerContent={
        <Flex
          justifyContent="space-between"
          mx="-0.5rem"
        >
          <AvatarAndRoleName
            wearerAddress={roleHat.wearer}
            name={roleHat.name}
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
        <Text textStyle="body-base">{roleHat.description}</Text>
      </Box>
      <Box
        px="1rem"
        mb="1.5rem"
      >
        <PayrollAndVesting />
      </Box>
    </DraggableDrawer>
  );
}
