import {
  Box,
  Tab,
  TabList,
  TabPanels,
  TabPanel,
  Tabs,
  Button,
  Flex,
  Tooltip,
} from '@chakra-ui/react';
import { useFormikContext } from 'formik';
import { useMemo, useState, useEffect, ReactNode, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Hex, zeroAddress } from 'viem';
import { TOOLTIP_MAXW } from '../../../../constants/common';
import { DAO_ROUTES } from '../../../../constants/routes';
import { useFractal } from '../../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../../providers/NetworkConfig/NetworkConfigProvider';
import { useRolesState } from '../../../../state/useRolesState';
import ModalTooltip from '../../../ui/modals/ModalTooltip';
import { EditBadgeStatus, EditedRole, RoleFormValues, RoleValue } from '../types';
import RoleFormInfo from './RoleFormInfo';
import RoleFormPayroll from './RoleFormPayroll';

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

export default function RoleFormTabs({ hatId, push }: { hatId: Hex; push: (obj: any) => void }) {
  const [tab, setTab] = useState<EditRoleTabs>(EditRoleTabs.RoleInfo);
  const { hatsTree } = useRolesState();
  const {
    node: { daoAddress },
  } = useFractal();
  const navigate = useNavigate();
  const { addressPrefix } = useNetworkConfig();

  const { t } = useTranslation(['roles']);
  const { values, errors, setFieldValue } = useFormikContext<RoleFormValues>();

  const existingRoleHat = useMemo(
    () =>
      hatsTree?.roleHats.find(
        (role: RoleValue) =>
          !!values.roleEditing && role.id === values.roleEditing.id && role.id !== zeroAddress,
      ),
    [values.roleEditing, hatsTree],
  );

  useEffect(() => {
    if (values.hats.length && !values.roleEditing) {
      const role = values.hats.find(hat => hat.id === hatId);
      if (role) {
        setFieldValue('roleEditing', role);
      }
    }
  }, [values.hats, values.roleEditing, hatId, setFieldValue]);

  const isRoleNameUpdated = !!existingRoleHat && values.roleEditing?.name !== existingRoleHat.name;

  const isRoleDescriptionUpdated =
    !!existingRoleHat && values.roleEditing?.description !== existingRoleHat.description;

  const isMemberUpdated =
    !!existingRoleHat && values.roleEditing?.wearer !== existingRoleHat.wearer;

  const editedRole = useMemo<EditedRole>(() => {
    if (!existingRoleHat) {
      return {
        fieldNames: [],
        status: EditBadgeStatus.New,
      };
    }
    let fieldNames: string[] = [];
    fieldNames = addRemoveField(fieldNames, 'roleName', isRoleNameUpdated);
    fieldNames = addRemoveField(fieldNames, 'roleDescription', isRoleDescriptionUpdated);
    fieldNames = addRemoveField(fieldNames, 'member', isMemberUpdated);

    return {
      fieldNames,
      status: EditBadgeStatus.Updated,
    };
  }, [existingRoleHat, isRoleNameUpdated, isRoleDescriptionUpdated, isMemberUpdated]);

  const vestingTabContainerRef = useRef<HTMLDivElement>(null);

  if (!daoAddress) return null;

  function ComingSoonTooltip({children}: {
    children: ReactNode;
  }) {
    if (vestingTabContainerRef) {
      return (
        <ModalTooltip
          containerRef={vestingTabContainerRef}
          maxW={TOOLTIP_MAXW}
          label="Coming soon"
        >
          {children}
        </ModalTooltip>
      );
    }

    return (
      <Tooltip
        label="Coming soon"
        aria-label="Coming soon"
      >
        {children}
      </Tooltip>
    );
  }

  return (
    <Box>
      <Tabs
        index={tab}
        onChange={index => setTab(index)}
        variant="twoTone"
      >
        <TabList>
          <Tab>{t('roleInfo')}</Tab>
          <Tab>
            <Flex>
                <Flex
                  px={{ base: '10vw', md: '5vw' }}
                  py="0.5rem"
                >
                  {t('payroll')}
                </Flex>
            </Flex>
          </Tab>
          <Tab isDisabled={true}>
            <Flex ref={vestingTabContainerRef}>
              <ComingSoonTooltip>
                <Flex
                  px={{ base: '10vw', md: '5vw' }}
                  py="0.5rem"
                >
                  {t('vesting')}
                </Flex>
              </ComingSoonTooltip>
            </Flex>
          </Tab>
        </TabList>
        <TabPanels my="1.75rem">
          <TabPanel>{tab === EditRoleTabs.RoleInfo && <RoleFormInfo />}</TabPanel>
          <TabPanel>{tab === EditRoleTabs.Payroll && <RoleFormPayroll />}</TabPanel>
          <TabPanel>{tab === EditRoleTabs.Vesting && <Box>Vesting</Box>}</TabPanel>
        </TabPanels>
      </Tabs>
      <Flex
        justifyContent="flex-end"
        my="1rem"
      >
        <Button
          isDisabled={!!errors.roleEditing}
          onClick={() => {
            const roleUpdated = { ...values.roleEditing, editedRole };
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
