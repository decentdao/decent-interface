import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerOverlay,
  Flex,
  Grid,
  GridItem,
  Icon,
  IconButton,
  Text,
} from '@chakra-ui/react';
import { List, PencilLine, User, X } from '@phosphor-icons/react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Hex, getAddress } from 'viem';
import { BACKGROUND_SEMI_TRANSPARENT, isFeatureEnabled } from '../../../constants/common';
import { useGetDAOName } from '../../../hooks/DAO/useGetDAOName';
import useAvatar from '../../../hooks/utils/useAvatar';
import { useFractal } from '../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import {
  paymentSorterByActiveStatus,
  paymentSorterByStartDate,
  paymentSorterByWithdrawAmount,
} from '../../../store/roles';
import Avatar from '../../ui/page/Header/Avatar';
import Divider from '../../ui/utils/Divider';
import { RolePaymentDetails } from './RolePaymentDetails';
import { RoleDetailsDrawerRoleHatProp } from './types';

function RoleAndDescriptionLabel({ label, icon }: { label: string; icon: React.ElementType }) {
  return (
    <Flex
      gap="0.5rem"
      alignItems="center"
    >
      <Icon as={icon} />
      <Text
        textStyle="label-base"
        color="neutral-7"
      >
        {label}
      </Text>
    </Flex>
  );
}

interface RoleDetailsDrawerProps {
  roleHat: RoleDetailsDrawerRoleHatProp;
  onOpen?: () => void;
  onClose: () => void;
  onEdit: (hatId: Hex) => void;
  isOpen?: boolean;
}

export default function RolesDetailsDrawer({
  roleHat,
  onClose,
  isOpen = true,
  onEdit,
}: RoleDetailsDrawerProps) {
  const {
    node: { daoAddress },
  } = useFractal();
  const { chain } = useNetworkConfig();
  const { t } = useTranslation(['roles']);
  const { daoName: accountDisplayName } = useGetDAOName({
    address: getAddress(roleHat.wearer),
    chainId: chain.id,
  });
  const avatarURL = useAvatar(roleHat.wearer);

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

  if (!daoAddress) return null;

  return (
    <Drawer
      placement="right"
      onClose={onClose ?? (() => {})}
      isOpen={isOpen}
    >
      <DrawerOverlay
        bg={BACKGROUND_SEMI_TRANSPARENT}
        backdropFilter="auto"
        backdropBlur="10px"
      />
      <DrawerContent
        minW="50%"
        bg="neutral-2"
        pt="1rem"
      >
        <DrawerBody h="100vh">
          <Flex
            justifyContent="space-between"
            my="1rem"
          >
            <IconButton
              variant="tertiary"
              size="icon-sm"
              aria-label="Close Drawer"
              as={X}
              onClick={onClose}
            />
            <Flex
              gap="0.5rem"
              alignItems="center"
            >
              {/* @todo add `...` Menu? */}
              <IconButton
                variant="tertiary"
                size="icon-sm"
                aria-label="Edit Role"
                as={PencilLine}
                onClick={() => onEdit(roleHat.id)}
              />
            </Flex>
          </Flex>
          <Text
            textStyle="display-2xl"
            color="white-0"
            my="1rem"
          >
            {roleHat.name}
          </Text>
          <Grid
            gridTemplateAreas={`"mLabel mValue"
            "dLabel dValue"`}
            gridRowGap="1rem"
            gridColumnGap="2rem"
          >
            <GridItem area="mLabel">
              <RoleAndDescriptionLabel
                label={t('member')}
                icon={User}
              />
            </GridItem>
            <GridItem area="dLabel">
              <RoleAndDescriptionLabel
                label={t('description')}
                icon={List}
              />
            </GridItem>
            <GridItem area="mValue">
              <Flex
                alignItems="center"
                gap="0.5rem"
              >
                <Avatar
                  size="icon"
                  address={getAddress(roleHat.wearer)}
                  url={avatarURL}
                />
                <Text
                  textStyle="body-base"
                  color="white-0"
                >
                  {accountDisplayName}
                </Text>
              </Flex>
            </GridItem>
            <GridItem area="dValue">
              <Text
                textStyle="body-base"
                color="white-0"
              >
                {roleHat.description}
              </Text>
            </GridItem>
          </Grid>
          {isFeatureEnabled('STREAMS') && roleHat.payments && (
            <>
              <Divider
                variant="darker"
                my={4}
              />
              <Text
                textStyle="display-lg"
                color="white-0"
              >
                {t('payments')}
              </Text>
              {sortedPayments.map((payment, index) => (
                <RolePaymentDetails
                  key={index}
                  payment={payment}
                  roleHatSmartAddress={roleHat.smartAddress}
                  roleHatWearerAddress={getAddress(roleHat.wearer)}
                  showWithdraw
                />
              ))}
            </>
          )}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
