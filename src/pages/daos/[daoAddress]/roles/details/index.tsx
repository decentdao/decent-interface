import { Show } from '@chakra-ui/react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import RolesDetailsDrawer from '../../../../../components/pages/Roles/RolesDetailsDrawer';
import RolesDetailsDrawerMobile from '../../../../../components/pages/Roles/RolesDetailsDrawerMobile';
import { DAO_ROUTES } from '../../../../../constants/routes';
import { useFractal } from '../../../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../../../providers/NetworkConfig/NetworkConfigProvider';
import { useRolesStore } from '../../../../../store/roles/useRolesStore';

export default function RoleDetails() {
  const {
    node: { daoAddress },
  } = useFractal();
  const navigate = useNavigate();
  const { addressPrefix } = useNetworkConfig();

  const { hatsTree } = useRolesStore();
  const [searchParams] = useSearchParams();
  const hatId = searchParams.get('hatId');
  const roleHat = hatsTree?.roleHats.find(hat => hat.id === hatId);

  // @todo add logic for loading
  // @todo add redirect for hat not found
  if (!roleHat || !daoAddress) return null;
  const handleDrawerClose = () => {
    navigate(DAO_ROUTES.roles.relative(addressPrefix, daoAddress), { replace: true });
  };

  const handleEditRoleClick = () => {
    navigate(DAO_ROUTES.rolesEditDetails.relative(addressPrefix, daoAddress, roleHat.id), {
      replace: true,
    });
  };
  return (
    <>
      <Show below="md">
        <RolesDetailsDrawerMobile
          roleHat={{ ...roleHat, wearer: roleHat.wearerAddress }}
          onClose={handleDrawerClose}
          onEdit={handleEditRoleClick}
        />
      </Show>
      <Show above="md">
        <RolesDetailsDrawer
          roleHat={{ ...roleHat, wearer: roleHat.wearerAddress }}
          onClose={handleDrawerClose}
          onEdit={handleEditRoleClick}
        />
      </Show>
    </>
  );
}
