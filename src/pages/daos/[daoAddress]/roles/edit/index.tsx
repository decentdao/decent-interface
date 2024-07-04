import { Box, Button, Flex, Show, Text } from '@chakra-ui/react';
import { Plus } from '@phosphor-icons/react';
import { Formik } from 'formik';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useNavigate } from 'react-router-dom';
import { RoleCardEdit } from '../../../../../components/pages/Roles/RoleCard';
import { RolesEditTable } from '../../../../../components/pages/Roles/RolesTable';
import {
  RoleFormValues,
  DEFAULT_ROLE_HAT,
  RoleValue,
} from '../../../../../components/pages/Roles/types';
import { Card } from '../../../../../components/ui/cards/Card';
import { BarLoader } from '../../../../../components/ui/loaders/BarLoader';
import PageHeader from '../../../../../components/ui/page/Header/PageHeader';
import { DAO_ROUTES } from '../../../../../constants/routes';
import { useRolesSchema } from '../../../../../hooks/schemas/roles/useRolesSchema';
import { useFractal } from '../../../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../../../providers/NetworkConfig/NetworkConfigProvider';
import { useRolesState } from '../../../../../state/useRolesState';

function RolesEdit() {
  const { t } = useTranslation(['roles', 'navigation', 'modals', 'breadcrumbs', 'common']);
  const [hats, setHats] = useState<RoleValue[]>([]);
  const {
    node: { daoAddress },
  } = useFractal();
  const { addressPrefix } = useNetworkConfig();

  const { rolesSchema } = useRolesSchema();
  const { hatsTree } = useRolesState();

  useEffect(() => {
    if (hatsTree !== null && hatsTree !== undefined) {
      setHats(hatsTree?.roleHats);
    }
  }, [hatsTree]);
  const navigate = useNavigate();

  if (daoAddress === null) return null;

  const showRoleEditDetails = (_hatIndex: number) => {
    navigate(DAO_ROUTES.rolesEditDetails.relative(addressPrefix, daoAddress, _hatIndex));
  };

  return (
    <Formik<RoleFormValues>
      initialValues={{
        proposalMetadata: {
          title: '',
          description: '',
        },
        hats,
      }}
      validationSchema={rolesSchema}
      validateOnMount
      onSubmit={values => {
        console.log('🚀 ~ values:', values);
        // @todo prepare transactions for adding/removing roles
        // @todo submit transactions
      }}
    >
      {({ handleSubmit, values, setFieldValue }) => (
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSubmit(e);
          }}
        >
          <Box>
            <PageHeader
              title={t('roles')}
              breadcrumbs={[
                {
                  terminus: t('roles', {
                    ns: 'roles',
                  }),
                  path: DAO_ROUTES.roles.relative(addressPrefix, daoAddress),
                },
                {
                  terminus: t('editRoles', {
                    ns: 'roles',
                  }),
                  path: '',
                },
              ]}
              buttonVariant="secondary"
              buttonText={t('addRole')}
              buttonProps={{
                size: 'sm',
                leftIcon: <Plus />,
              }}
              buttonClick={() => {
                setFieldValue('roleEditing', DEFAULT_ROLE_HAT);
                showRoleEditDetails(values.hats.length);
              }}
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
              <RolesEditTable handleRoleClick={showRoleEditDetails} />
            </Show>
            <Show below="md">
              {values.hats &&
                values.hats.map((hat, index) => (
                  <RoleCardEdit
                    key={index}
                    name={hat.name}
                    wearerAddress={hat.wearer}
                    editStatus={hat.editedRole?.status}
                    handleRoleClick={() => {
                      setFieldValue('roleEditing', hat);
                      showRoleEditDetails(index);
                    }}
                  />
                ))}
            </Show>
          </Box>
          <Flex
            gap="1rem"
            justifyContent="flex-end"
          >
            <Button
              variant="tertiary"
              onClick={() => navigate(DAO_ROUTES.roles.relative(addressPrefix, daoAddress))}
            >
              {t('cancel', { ns: 'common' })}
            </Button>
            <Button
              onClick={() =>
                navigate(
                  DAO_ROUTES.rolesEditCreateProposalSummary.relative(addressPrefix, daoAddress),
                )
              }
              isDisabled={!values.hats.some(hat => hat.editedRole)}
            >
              {t('createProposal', { ns: 'modals' })}
            </Button>
          </Flex>
          <Outlet />
        </form>
      )}
    </Formik>
  );
}

export default RolesEdit;
