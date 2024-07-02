import { Box, Flex, Icon, Portal, Show, Text } from '@chakra-ui/react';
import { ArrowLeft } from '@phosphor-icons/react';
import { FieldArray, useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import RoleFormTabs from '../../../../../../components/pages/Roles/forms/RoleFormTabs';
import { RoleFormValues } from '../../../../../../components/pages/Roles/types';
import { useHeaderHeight } from '../../../../../../constants/common';
import { DAO_ROUTES } from '../../../../../../constants/routes';
import { useFractal } from '../../../../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../../../../providers/NetworkConfig/NetworkConfigProvider';

export default function RoleEditDetails() {
  const headerHeight = useHeaderHeight();
  const { t } = useTranslation(['roles']);
  const {
    node: { daoAddress },
  } = useFractal();
  const { addressPrefix } = useNetworkConfig();
  const navigate = useNavigate();
  const { values } = useFormikContext<RoleFormValues>();
  const [searchParams] = useSearchParams();
  const hatEditingIndex = searchParams.get('hatIndex')
    ? parseInt(searchParams.get('hatIndex') as string)
    : undefined;
  if (!daoAddress) return null;
  if (hatEditingIndex === undefined) return null;

  return (
    <FieldArray name="hats">
      {({ remove }) => (
        <Show below="md">
          <Portal>
            <Box
              position="fixed"
              top={headerHeight}
              h={`100vh`}
              w="full"
              bg="neutral-1"
              px="1rem"
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
                    if (values.hats[hatEditingIndex].id < 0) {
                      remove(hatEditingIndex);
                    }
                    navigate(DAO_ROUTES.rolesEdit.relative(addressPrefix, daoAddress));
                  }}
                >
                  <Icon
                    as={ArrowLeft}
                    boxSize="1.5rem"
                  />
                  <Text textStyle="display-lg">{t('editRoles')}</Text>
                </Flex>
              </Flex>

              <RoleFormTabs
                hatIndex={hatEditingIndex}
                save={() => {
                  navigate(DAO_ROUTES.rolesEdit.relative(addressPrefix, daoAddress));
                }}
              />
            </Box>
          </Portal>
        </Show>
      )}
    </FieldArray>
  );
}
