import { useSearchParams } from 'react-router-dom';
import RolesDetails from '../../../../components/Roles/RoleDetails';

import { useDaoInfoStore } from '../../../../store/daoInfo/useDaoInfoStore';
import { useRolesStore } from '../../../../store/roles/useRolesStore';

export function SafeRoleDetailsPage() {
  const { safe } = useDaoInfoStore();

  const { hatsTree } = useRolesStore();
  const [searchParams] = useSearchParams();
  const hatId = searchParams.get('hatId');
  const roleHat = hatsTree?.roleHats.find(hat => hat.id === hatId);
  const safeAddress = safe?.address;

  // @todo add logic for loading
  // @todo add redirect for hat not found
  if (!roleHat || !safeAddress) return null;

  return <RolesDetails roleHat={{ ...roleHat, wearer: roleHat.wearerAddress }} />;
}
