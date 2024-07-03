import { Box, Show, Text } from '@chakra-ui/react';
import { Pencil } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Address, zeroAddress } from 'viem';
import { RoleCard } from '../../../../components/pages/Roles/RoleCard';
import { RolesTable } from '../../../../components/pages/Roles/RolesTable';
import { Card } from '../../../../components/ui/cards/Card';
import { BarLoader } from '../../../../components/ui/loaders/BarLoader';
import PageHeader from '../../../../components/ui/page/Header/PageHeader';
import { DAO_ROUTES } from '../../../../constants/routes';
import { useFractal } from '../../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../../providers/NetworkConfig/NetworkConfigProvider';
import { useRolesState } from '../../../../state/useRolesState';
function Roles() {
  const { hatsTree } = useRolesState();
  console.log("🚀 ~ hatsTree:", hatsTree)
  const { addressPrefix } = useNetworkConfig();
  const { t } = useTranslation(['roles', 'navigation', 'breadcrumbs', 'dashboard']);
  const {
    node: { daoAddress },
  } = useFractal();
  const navigate = useNavigate();

  if (!daoAddress) return null;
  const handleRoleClick = (hatId: Address) => {
    // @todo open role details drawer
    // For Mobile, This is a new screen
    return hatId; // @todo remove this line
  };
  return (
    <Box>
      <PageHeader
        title={t('roles')}
        breadcrumbs={[
          {
            terminus: t('roles', {
              ns: 'roles',
            }),
            path: '',
          },
        ]}
        buttonVariant="secondary"
        buttonText={t('editRoles')}
        buttonProps={{
          size: 'sm',
          leftIcon: <Pencil />,
        }}
        buttonClick={() => navigate(DAO_ROUTES.rolesEdit.relative(addressPrefix, daoAddress))}
      />
      {hatsTree === undefined && (
        <Card
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <BarLoader />
        </Card>
      )}
      {hatsTree === null && (
        <Card my="0.5rem">
          <Text
            textStyle="body-base"
            textAlign="center"
            color="white-alpha-16"
          >
            {t('noRoles')}
          </Text>
        </Card>
      )}
      <Show above="md">
        <RolesTable
          handleRoleClick={handleRoleClick}
          roleHats={[]}
        />
      </Show>
      <Show below="md">
        {hatsTree &&
          hatsTree.roleHats.map((roleHat, index) => (
            <RoleCard
              key={index}
              name={roleHat.name}
              wearerAddress={roleHat.wearer || zeroAddress}
              hatId={roleHat.id}
              handleRoleClick={() => handleRoleClick(roleHat.id)}
            />
          ))}
        {/* // @todo implement RoleCard by looping through roleHats */}
      </Show>
    </Box>
  );
}

export default Roles;
