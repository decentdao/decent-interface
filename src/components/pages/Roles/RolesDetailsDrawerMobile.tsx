import { Box, Flex, Icon, IconButton, Text } from '@chakra-ui/react';
import { PencilLine } from '@phosphor-icons/react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import useAddress from '../../../hooks/utils/useAddress';
import { useFractal } from '../../../providers/App/AppProvider';
import {
  paymentSorterByActiveStatus,
  paymentSorterByStartDate,
  paymentSorterByWithdrawAmount,
  useRolesStore,
} from '../../../store/roles';
import DraggableDrawer from '../../ui/containers/DraggableDrawer';
import Divider from '../../ui/utils/Divider';
import { AvatarAndRoleName } from './RoleCard';
import { RolePaymentDetails } from './RolePaymentDetails';
import { RoleDetailsDrawerProps } from './types';

export default function RolesDetailsDrawerMobile({
  roleHat,
  onClose,
  onOpen,
  isOpen = true,
  onEdit,
}: RoleDetailsDrawerProps) {
  const {
    node: { daoAddress },
  } = useFractal();
  const { t } = useTranslation('roles');
  const { hatsTree } = useRolesStore();

  const sortedPayments = useMemo(
    () =>
      roleHat.payments
        ? [...roleHat.payments]
            .sort(paymentSorterByWithdrawAmount)
            .sort(paymentSorterByStartDate)
            .sort(paymentSorterByActiveStatus)
        : [],
    [roleHat.payments],
  );

  let roleHatWearerENSOrAddress: string =
    'wearer' in roleHat ? roleHat.wearer : roleHat.wearerAddress;

  const { address: roleHatWearerAddress } = useAddress(roleHatWearerENSOrAddress);

  if (!daoAddress || !hatsTree) return null;

  return (
    <DraggableDrawer
      onClose={onClose ?? (() => {})}
      onOpen={onOpen ?? (() => {})}
      isOpen={isOpen}
      headerContent={
        <Flex
          justifyContent="space-between"
          mx="-0.5rem"
        >
          <AvatarAndRoleName
            wearerAddress={roleHatWearerAddress}
            name={roleHat.name}
          />
          <Flex
            alignItems="center"
            gap="1rem"
          >
            <IconButton
              variant="tertiary"
              aria-label="Edit Role"
              onClick={() => onEdit(roleHat.id)}
              size="icon-sm"
              icon={
                <Icon
                  as={PencilLine}
                  color="lilac-0"
                  aria-hidden
                  weight="fill"
                />
              }
            />
          </Flex>
        </Flex>
      }
    >
      <Box
        px="1rem"
        mb="1rem"
      >
        <Text
          color="neutral-7"
          textStyle="button-small"
        >
          {t('roleDescription')}
        </Text>
        <Text textStyle="body-base">{roleHat.description}</Text>
      </Box>
      <Box
        px="1rem"
        mb="1.5rem"
      >
        {roleHat.payments && (
          <>
            <Divider
              variant="darker"
              my={4}
            />
            <Text
              textStyle="display-lg"
              color="white-0"
              mt="1.5rem"
              mb="1rem"
            >
              {t('payments')}
            </Text>
            {sortedPayments.map((payment, index) => (
              <RolePaymentDetails
                key={index}
                payment={payment}
                roleHatSmartAddress={roleHat.smartAddress}
                roleHatWearerAddress={roleHatWearerAddress}
                showWithdraw
              />
            ))}
          </>
        )}
      </Box>
    </DraggableDrawer>
  );
}
