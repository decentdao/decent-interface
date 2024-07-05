import { Show } from '@chakra-ui/react';
import { useSearchParams } from 'react-router-dom';
import RolesDetailsDrawer from '../../../../../components/pages/Roles/RolesDetailsDrawer';
import RolesDetailsDrawerMobile from '../../../../../components/pages/Roles/RolesDetailsDrawerMobile';
import { useRolesState } from '../../../../../state/useRolesState';

export default function RoleDetails() {
  const { hatsTree } = useRolesState();
  const [searchParams] = useSearchParams();
  const hatId = searchParams.get('hatId');
  const roleHat = hatsTree?.roleHats.find(hat => hat.id === hatId);

  // @todo add logic for loading
  // @todo add redirect for hat not found
  if (!roleHat) return null;
  return (
    <>
      <Show below="md">
        <RolesDetailsDrawerMobile roleHat={roleHat} />
      </Show>
      <Show above="md">
        <RolesDetailsDrawer roleHat={roleHat} />
      </Show>
    </>
  );
}
