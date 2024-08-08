import {
  Box,
  Tab,
  TabList,
  TabPanels,
  TabPanel,
  Tabs,
  Button,
  Flex,
  IconButton,
} from '@chakra-ui/react';
import { X } from '@phosphor-icons/react';
import { FieldArray, useFormikContext } from 'formik';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Hex } from 'viem';
import { DAO_ROUTES } from '../../../../constants/routes';
import { useFractal } from '../../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../../providers/NetworkConfig/NetworkConfigProvider';
import { useRolesStore } from '../../../../store/roles';
import { EditBadgeStatus, RoleFormValues } from '../types';
import RoleFormInfo from './RoleFormInfo';
import RoleFormPaymentStream from './RoleFormPaymentStream';
import { useRoleFormEditedRole } from './useRoleFormEditedRole';

export default function RoleFormTabs({
  hatId,
  pushRole,
}: {
  hatId: Hex;
  pushRole: (obj: any) => void;
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

  return (
    <FieldArray name="roleEditing.payments">
      {({ push: pushPayment, remove: removePayment }) => (
        <>
          <Tabs variant="twoTone">
            <TabList>
              <Tab>{t('roleInfo')}</Tab>
              {!!hatsTree &&
                values.roleEditing?.payments &&
                values.roleEditing.payments.map((_, i) => {
                  const savedRole = values.hats.find(hat => hat.id === hatId)?.payments?.[i];
                  const existingRoleHatPayment = hatsTree?.roleHats.find(hat => hat.id === hatId)
                    ?.payments?.[i];
                  return (
                    <Box key={i}>
                      <Tab key={i}>
                        {t('paymentStream')}
                        {!savedRole && !existingRoleHatPayment && (
                          <IconButton
                            aria-label="Remove payment stream"
                            size="icon-sm"
                            variant="tertiary"
                            as={X}
                            onClick={() => {
                              removePayment(i);
                            }}
                            ml="1rem"
                          />
                        )}
                      </Tab>
                    </Box>
                  );
                })}
              {!!hatsTree && (values.roleEditing?.payments?.length ?? 0) < 2 && (
                <Tab>{t('paymentStream')}</Tab>
              )}
            </TabList>
            <TabPanels my="1.75rem">
              <TabPanel>
                <RoleFormInfo />
              </TabPanel>
              {values.roleEditing?.payments &&
                values.roleEditing.payments.map((_, i) => (
                  <TabPanel key={i}>
                    <RoleFormPaymentStream formIndex={i} />
                  </TabPanel>
                ))}
              {(values.roleEditing?.payments?.length ?? 0) < 2 && (
                <TabPanel>
                  <Box>
                    <Button
                      onClick={() => {
                        pushPayment({
                          scheduleType: 'duration',
                        });
                      }}
                    >
                      Add New Payment Stream
                    </Button>
                  </Box>
                </TabPanel>
              )}
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
                  pushRole(roleUpdated);
                } else {
                  setFieldValue(
                    `hats.${hatIndex}`,
                    isRoleUpdated || editedRoleData.status === EditBadgeStatus.New
                      ? roleUpdated
                      : existingRoleHat,
                  );
                }
                setFieldValue('roleEditing', undefined);
                setTimeout(() => {
                  setTouched({});
                  navigate(DAO_ROUTES.rolesEdit.relative(addressPrefix, daoAddress));
                }, 50);
              }}
            >
              {t('save')}
            </Button>
          </Flex>
        </>
      )}
    </FieldArray>
  );
}
