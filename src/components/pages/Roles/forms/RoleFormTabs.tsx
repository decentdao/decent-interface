import { Button, Flex, Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import { useFormikContext } from 'formik';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Blocker, useNavigate } from 'react-router-dom';
import { Hex } from 'viem';
import { DAO_ROUTES } from '../../../../constants/routes';
import { useFractal } from '../../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../../providers/NetworkConfig/NetworkConfigProvider';
import { useRolesStore } from '../../../../store/roles';
import { EditBadgeStatus, RoleFormValues, RoleHatFormValue } from '../types';
import RoleFormInfo from './RoleFormInfo';
import RoleFormMember from './RoleFormMember';
import RoleFormPaymentStream from './RoleFormPaymentStream';
import { RoleFormPaymentStreams } from './RoleFormPaymentStreams';
import { useRoleFormEditedRole } from './useRoleFormEditedRole';

export default function RoleFormTabs({
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
  const { editedRoleData, isRoleUpdated, existingRoleHat } = useRoleFormEditedRole({ hatsTree });
  const { t } = useTranslation(['roles']);
  const { values, errors, setFieldValue, setTouched } = useFormikContext<RoleFormValues>();

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
    return <RoleFormPaymentStream formIndex={values.roleEditing?.roleEditingPaymentIndex} />;
  }

  return (
    <>
      {/* <Button
        variant="secondary"
        size="sm"
        onClick={() => {
          setFieldValue('roleEditing', undefined);
          const hats = values.hats.filter(hat => hat.id !== hatId);
          const hardCodedTermedCole: RoleHatFormValueEdited = {
            editedRole: {
              status: EditBadgeStatus.New,
              fieldNames: [],
            },
            id: hatId,
            name: 'Termed Role',
            description: 'A new Term Role',
            wearer: '0x629750317d320B8bB4d48D345A6d699Cc855c4a6',
            isTermed: true,
            roleTerms: [
              {
                nominee: '0x629750317d320B8bB4d48D345A6d699Cc855c4a6',
                termEndDateTs: Math.floor(Date.now() / 1000) + 2 * 24 * 60 * 60,
              },
            ],
          };
          setFieldValue(`hats`, [...hats, hardCodedTermedCole]);
          navigate(DAO_ROUTES.rolesEdit.relative(addressPrefix, daoAddress));
        }}
      >
        Add Reqular Role
      </Button> */}
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
              setFieldValue(
                `hats.${hatIndex}`,
                isRoleUpdated || editedRoleData.status === EditBadgeStatus.New
                  ? roleUpdated
                  : existingRoleHat,
              );
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
