import { Button, Flex, Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import { useFormikContext } from 'formik';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Blocker, useNavigate } from 'react-router-dom';
import { Hex } from 'viem';
import { DAO_ROUTES } from '../../../constants/routes';
import { useFractal } from '../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { useRolesStore } from '../../../store/roles/useRolesStore';
import { EditBadgeStatus, RoleFormValues, RoleHatFormValue } from '../../../types/roles';
import RoleFormInfo from './RoleFormInfo';
import { RoleFormMember } from './RoleFormMember';
import RoleFormPaymentStream from './RoleFormPaymentStream';
import RoleFormPaymentStreamTermed from './RoleFormPaymentStreamTermed';
import { RoleFormPaymentStreams } from './RoleFormPaymentStreams';
import { useRoleFormEditedRole } from './useRoleFormEditedRole';

export function RoleFormTabs({
  hatId,
  pushRole,
  blocker,
}: {
  hatId: Hex;
  pushRole: (roleHatFormValue: RoleHatFormValue) => void;
  blocker: Blocker;
}) {
  const { hatsTree } = useRolesStore();
  const {
    node: { daoAddress },
  } = useFractal();
  const navigate = useNavigate();
  const { addressPrefix } = useNetworkConfig();
  const { isRoleUpdated, existingRoleHat } = useRoleFormEditedRole({ hatsTree });
  const { t } = useTranslation(['roles']);
  const { values, setFieldValue, errors, setTouched } = useFormikContext<RoleFormValues>();

  useEffect(() => {
    if (values.hats.length && !values.roleEditing) {
      const role = values.hats.find(hat => hat.id === hatId);
      if (role) {
        setFieldValue('roleEditing', role);
      }
    }
  }, [values.hats, values.roleEditing, hatId, setFieldValue]);

  const isInitialised = useRef(false);

  useEffect(() => {
    const hatIndex = values.hats.findIndex(h => h.id === hatId);
    if (!isInitialised.current && values.hats.length && hatIndex !== -1) {
      isInitialised.current = true;
      const role = values.hats[hatIndex];
      setFieldValue('roleEditing', role);
    } else if (!isInitialised.current && hatIndex === -1) {
      isInitialised.current = true;
    }
  }, [setFieldValue, values.hats, values.roleEditing, hatId]);

  if (!daoAddress) return null;

  if (values.roleEditing?.roleEditingPaymentIndex !== undefined) {
    if (values.roleEditing?.isTermed) {
      return (
        <RoleFormPaymentStreamTermed paymentIndex={values.roleEditing?.roleEditingPaymentIndex} />
      );
    } else {
      return <RoleFormPaymentStream formIndex={values.roleEditing?.roleEditingPaymentIndex} />;
    }
  }

  return (
    <>
      <Tabs variant="twoTone">
        <TabList>
          <Tab>{t('roleInfo')}</Tab>
          <Tab>{t('member')}</Tab>
          <Tab>{t('payments')}</Tab>
        </TabList>
        <TabPanels my="1.75rem">
          <TabPanel>
            <RoleFormInfo />
          </TabPanel>
          <TabPanel>
            <RoleFormMember />
          </TabPanel>
          <TabPanel>
            <RoleFormPaymentStreams />
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
            if (!values.roleEditing) return;
            const roleUpdated = { ...values.roleEditing, editedRole: editedRoleData };
            const hatIndex = values.hats.findIndex(h => h.id === hatId);
            if (hatIndex === -1) {
              pushRole({ ...roleUpdated });
            } else {
              if (isRoleUpdated || editedRoleData.status === EditBadgeStatus.New) {
                setFieldValue(`hats.${hatIndex}`, roleUpdated);
              } else if (existingRoleHat !== undefined) {
                setFieldValue(`hats.${hatIndex}`, {
                  ...existingRoleHat,
                  roleTerms: existingRoleHat.roleTerms.allTerms,
                });
              }
            }
            setFieldValue('roleEditing', undefined);
            setTouched({});
            if (blocker.reset) {
              blocker.reset();
            }
            setTimeout(() => {
              navigate(DAO_ROUTES.rolesEdit.relative(addressPrefix, daoAddress));
            }, 50);
          }}
        >
          {t('save')}
        </Button>
      </Flex>
    </>
  );
}
