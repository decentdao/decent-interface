import { Show } from '@chakra-ui/react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DraggableDrawer from '../../../../../components/ui/containers/DraggableDrawer';
import { DAO_ROUTES } from '../../../../../constants/routes';
import { useFractal } from '../../../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../../../providers/NetworkConfig/NetworkConfigProvider';
import { useRolesState } from '../../../../../state/useRolesState';

export default function RoleDetails() {
  const {
    node: { daoAddress },
  } = useFractal();
  const { hatsTree } = useRolesState();
  const { addressPrefix } = useNetworkConfig();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  if (!daoAddress) return null;
  const hatIndex = searchParams.get('hatIndex')
    ? parseInt(searchParams.get('hatIndex') as string)
    : -1;
  const hat = hatsTree?.roleHats[hatIndex];
  if (hat === undefined) return null;

  return (
    <><Show below="md">
      <DraggableDrawer
        isOpen
        onOpen={() => {}}
        onClose={() => navigate(DAO_ROUTES.roles.relative(addressPrefix, daoAddress))}
        headerContent={null}
      >
        Hello world
      </DraggableDrawer>
    </Show>
    <Show above="md">
            {/* @todo - show hat details side modal */}
    </Show>
    </>
  );
}
