import { Show } from '@chakra-ui/react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import RolesDetailsDrawer from '../../../../../components/pages/Roles/RolesDetailsDrawer';
import RolesDetailsDrawerMobile from '../../../../../components/pages/Roles/RolesDetailsDrawerMobile';
import { DAO_ROUTES } from '../../../../../constants/routes';
import { useFractal } from '../../../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../../../providers/NetworkConfig/NetworkConfigProvider';
import { useRolesState } from '../../../../../state/roles';

export default function RoleDetails() {
  const {
    node: { daoAddress },
  } = useFractal();
  const navigate = useNavigate();
  const { addressPrefix } = useNetworkConfig();

  const { hatsTree } = useRolesState();
  const [searchParams] = useSearchParams();
  const hatId = searchParams.get('hatId');
  const roleHat = hatsTree?.roleHats.find(hat => hat.id === hatId);

  // @todo add logic for loading
  // @todo add redirect for hat not found
  if (!roleHat || !daoAddress) return null;
  const handleDrawerClose = () => {
    navigate(DAO_ROUTES.roles.relative(addressPrefix, daoAddress));
  };

  const handleEditRoleClick = () => {
    navigate(DAO_ROUTES.rolesEditDetails.relative(addressPrefix, daoAddress, roleHat.id));
  };
  return (
    <>
      <Show below="md">
        <RolesDetailsDrawerMobile
          roleHat={roleHat}
          onClose={handleDrawerClose}
          onEdit={handleEditRoleClick}
          payment={roleHat.vesting}
        />
      </Show>
      <Show above="md">
        <RolesDetailsDrawer
          roleHat={roleHat}
          onClose={handleDrawerClose}
          onEdit={handleEditRoleClick}
          payment={roleHat.vesting}
        />
      </Show>
    </>
  );
}
