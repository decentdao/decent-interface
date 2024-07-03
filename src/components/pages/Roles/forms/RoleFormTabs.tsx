import { Box, Tab, TabList, TabPanels, TabPanel, Tabs, Button, Flex } from '@chakra-ui/react';
import { useFormikContext } from 'formik';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { zeroAddress } from 'viem';
import { useRolesState } from '../../../../state/useRolesState';
import { EditBadgeStatus, EditedRole, RoleFormValues, RoleValue } from '../types';
import RoleFormInfo from './RoleFormInfo';

enum EditRoleTabs {
  RoleInfo,
  Payroll,
  Vesting,
}

const addRemoveField = (fieldNames: string[], fieldName: string, isRemoved: boolean) => {
  if (fieldNames.includes(fieldName) && isRemoved) {
    return fieldNames.filter(field => field !== fieldName);
  }
  return [...fieldNames, fieldName];
};

export default function RoleFormTabs({ hatIndex, save }: { hatIndex: number; save: () => void }) {
  const [tab, setTab] = useState<EditRoleTabs>(EditRoleTabs.RoleInfo);
  const { hatsTree } = useRolesState();

  const { t } = useTranslation(['roles']);
  const { values, errors, setFieldValue } = useFormikContext<RoleFormValues>();
  const editingRole = useMemo(() => values.hats[hatIndex], [hatIndex, values.hats]);

  const existingRoleHat = useMemo(
    () =>
      hatsTree?.roleHats.find(
        (role: RoleValue) => role.id === editingRole.id && role.id !== zeroAddress,
      ),
    [editingRole, hatsTree],
  );
  const isRoleNameUpdated = useMemo<boolean>(
    () => !!existingRoleHat && editingRole.name !== existingRoleHat.name,
    [editingRole, existingRoleHat],
  );

  const isRoleDescriptionUpdated = useMemo<boolean>(
    () => !!existingRoleHat && editingRole.description !== existingRoleHat.description,
    [editingRole, existingRoleHat],
  );

  const isMemberUpdated = useMemo<boolean>(
    () => !!existingRoleHat && editingRole.wearer !== existingRoleHat.wearer,
    [editingRole, existingRoleHat],
  );

  const editedRole = useMemo<EditedRole>(() => {
    if (!existingRoleHat) {
      return {
        fieldNames: [],
        status: EditBadgeStatus.New,
      };
    }
    let fieldNames: string[] = ['roleName', 'roleDescription', 'member'];
    fieldNames = addRemoveField(fieldNames, 'roleName', isRoleNameUpdated);
    fieldNames = addRemoveField(fieldNames, 'roleDescription', isRoleDescriptionUpdated);
    fieldNames = addRemoveField(fieldNames, 'member', isMemberUpdated);

    return {
      fieldNames,
      status: EditBadgeStatus.Updated,
    };
  }, [existingRoleHat, isRoleNameUpdated, isRoleDescriptionUpdated, isMemberUpdated]);

  return (
    <Box>
      <Tabs
        index={tab}
        onChange={index => setTab(index)}
        variant="unstyled"
      >
        <TabList
          boxShadow="0 -1px 0 0 rgba(0, 0, 0, 0.24), 0 1px 0 0 rgba(255, 255, 255, 0.12)"
          p="0.25rem"
          borderRadius="0.5rem"
          gap="0.25rem"
        >
          <Tab
            w="full"
            borderRadius="0.25rem"
            color="neutral-6"
            _selected={{
              bg: 'neutral-2',
              color: 'lilac-0',
              boxShadow:
                '0 1px 0 0 rgba(248, 244, 252, 0.04), 0 1px 1px 0 rgba(248, 244, 252, 0.04), 0 0 1px 1px rgba(16, 4, 20, 1)',
            }}
          >
            Role Info
          </Tab>
          <Tab
            w="full"
            color="neutral-6"
            borderRadius="0.25rem"
            isDisabled
            _selected={{
              bg: 'neutral-2',
              color: 'lilac-0',
              boxShadow:
                '0 1px 0 0 rgba(248, 244, 252, 0.04), 0 1px 1px 0 rgba(248, 244, 252, 0.04), 0 0 1px 1px rgba(16, 4, 20, 1)',
            }}
          >
            Payroll
          </Tab>
          <Tab
            w="full"
            color="neutral-6"
            borderRadius="0.25rem"
            isDisabled
            _selected={{
              bg: 'neutral-2',
              color: 'lilac-0',
              boxShadow:
                '0 1px 0 0 rgba(248, 244, 252, 0.04), 0 1px 1px 0 rgba(248, 244, 252, 0.04), 0 0 1px 1px rgba(16, 4, 20, 1)',
            }}
          >
            Vesting
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel
            padding="0"
            my="1.75rem"
          >
            {tab === EditRoleTabs.RoleInfo && <RoleFormInfo hatIndex={hatIndex} />}
          </TabPanel>
          <TabPanel>{tab === EditRoleTabs.Payroll && <Box>Payroll</Box>}</TabPanel>
          <TabPanel>{tab === EditRoleTabs.Vesting && <Box>Vesting</Box>}</TabPanel>
        </TabPanels>
      </Tabs>
      <Flex
        justifyContent="flex-end"
        my="1rem"
      >
        <Button
          isDisabled={!!errors.hats?.[hatIndex]}
          onClick={() => {
            setFieldValue(`hats.${hatIndex}`, { ...values.hats[hatIndex], editedRole });
            save();
          }}
        >
          {t('save')}
        </Button>
      </Flex>
    </Box>
  );
}
