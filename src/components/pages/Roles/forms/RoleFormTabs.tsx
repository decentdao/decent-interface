import { Box, Tab, TabList, TabPanels, TabPanel, Tabs, Button, Flex } from '@chakra-ui/react';
import { useFormikContext } from 'formik';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Hex } from 'viem';
import { DAO_ROUTES } from '../../../../constants/routes';
import { useFractal } from '../../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../../providers/NetworkConfig/NetworkConfigProvider';
import { useRolesState } from '../../../../state/useRolesState';
import { RoleFormValues } from '../types';
import RoleFormInfo from './RoleFormInfo';
import RoleFormPaymentStream from './RoleFormPaymentStream';
import { useRoleFormEditedRole } from './useRoleFormEditedRole';

export default function RoleFormTabs({ hatId, push }: { hatId: Hex; push: (obj: any) => void }) {
  const { hatsTree } = useRolesState();
  const {
    node: { daoAddress },
  } = useFractal();
  const navigate = useNavigate();
  const { addressPrefix } = useNetworkConfig();
  const { editedRoleData } = useRoleFormEditedRole({ hatsTree });
  const { t } = useTranslation(['roles']);
  const { values, errors, setFieldValue } = useFormikContext<RoleFormValues>();

  useEffect(() => {
    if (values.hats.length && !values.roleEditing) {
      const role = values.hats.find(hat => hat.id === hatId);
      if (role) {
        setFieldValue('roleEditing', role);
      }
    }
  }, [values.hats, values.roleEditing, hatId, setFieldValue]);

  if (!daoAddress) return null;

  return (
    <Box>
      <Tabs variant="twoTone">
        <TabList>
          <Tab>{t('roleInfo')}</Tab>
          <Tab>{t('paymentStream')}</Tab>
        </TabList>
        <TabPanels my="1.75rem">
          <TabPanel>
            <RoleFormInfo />
          </TabPanel>
          <TabPanel>
            <RoleFormPaymentStream />
          </TabPanel>
        </TabPanels>
      </Tabs>
      <Flex
        justifyContent="flex-end"
        my="1rem"
      >
        <Button
          isDisabled={!!errors.roleEditing}
          onClick={() => {
            const roleUpdated = { ...values.roleEditing, editedRole: editedRoleData };
            const hatIndex = values.hats.findIndex(h => h.id === hatId);
            if (hatIndex === -1) {
              // @dev new hat
              push(roleUpdated);
            } else {
              setFieldValue(`hats.${hatIndex}`, roleUpdated);
            }
            setFieldValue('roleEditing', undefined);
            navigate(DAO_ROUTES.rolesEdit.relative(addressPrefix, daoAddress));
          }}
        >
          {t('save')}
        </Button>
      </Flex>
    </Box>
  );
}
