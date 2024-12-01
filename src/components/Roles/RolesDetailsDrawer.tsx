import {
  Badge,
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
import { CheckSquare, List, User, X } from '@phosphor-icons/react';
import { RefObject, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import PencilWithLineIcon from '../../assets/theme/custom/icons/PencilWithLineIcon';
import { BACKGROUND_SEMI_TRANSPARENT } from '../../constants/common';
import useAddress from '../../hooks/utils/useAddress';
import useAvatar from '../../hooks/utils/useAvatar';
import { useGetAccountName } from '../../hooks/utils/useGetAccountName';
import { useDaoInfoStore } from '../../store/daoInfo/useDaoInfoStore';
import {
  paymentSorterByActiveStatus,
  paymentSorterByStartDate,
  paymentSorterByWithdrawAmount,
} from '../../store/roles/rolesStoreUtils';
import { RoleDetailsDrawerProps } from '../../types/roles';
import { BarLoader } from '../ui/loaders/BarLoader';
import ModalTooltip from '../ui/modals/ModalTooltip';
import Avatar from '../ui/page/Header/Avatar';
import Divider from '../ui/utils/Divider';
import RoleDetailsTabs from './RoleDetailsTabs';

export function RoleProposalPermissionBadge({
  containerRef,
}: {
  containerRef: RefObject<HTMLDivElement>;
}) {
  const { t } = useTranslation('roles');
  return (
    <ModalTooltip
      containerRef={containerRef}
      label={t('permissionsProposalsTooltip')}
    >
      <Badge
        color="celery-0"
        bgColor="celery--6"
        textTransform="unset"
        fontSize="1rem"
        lineHeight="1.5rem"
        fontWeight="normal"
        borderRadius="0.25rem"
        px="0.5rem"
      >
        {t('permissionsProposals')}
      </Badge>
    </ModalTooltip>
  );
}
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

export default function RolesDetailsDrawer({
  roleHat,
  onClose,
  isOpen = true,
  onEdit,
}: RoleDetailsDrawerProps) {
  const { safe } = useDaoInfoStore();
  const permissionsContainerRef = useRef<HTMLDivElement>(null);

  const roleHatWearer = 'wearer' in roleHat ? roleHat.wearer : roleHat.wearerAddress;

  const { address: roleHatWearerAddress, isLoading: loadingRoleHatWearerAddress } =
    useAddress(roleHatWearer);

  const { displayName } = useGetAccountName(roleHatWearerAddress);

  const { t } = useTranslation(['roles']);
  const avatarURL = useAvatar(roleHatWearer);

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

  if (!safe?.address) return null;

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
                as={PencilWithLineIcon}
                onClick={() => onEdit(roleHat.id)}
              />
            </Flex>
          </Flex>
          <Text
            textStyle="heading-large"
            color="white-0"
            my="1rem"
          >
            {roleHat.name}
          </Text>
          <Grid
            gridTemplateAreas={`
              "mLabel mValue"
              "dLabel dValue"
              "pLabel pValue"
            `}
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
            <GridItem area="pLabel">
              {roleHat.canCreateProposals && (
                <RoleAndDescriptionLabel
                  label={t('permissions')}
                  icon={CheckSquare}
                />
              )}
            </GridItem>
            <GridItem area="mValue">
              <Flex
                alignItems="center"
                gap="0.5rem"
              >
                {loadingRoleHatWearerAddress || !roleHatWearerAddress ? (
                  <BarLoader />
                ) : (
                  <Avatar
                    size="icon"
                    address={roleHatWearerAddress}
                    url={avatarURL}
                  />
                )}
                <Text color="white-0">{displayName}</Text>
              </Flex>
            </GridItem>
            <GridItem area="dValue">
              <Text color="white-0">{roleHat.description}</Text>
            </GridItem>
            <GridItem
              area="pValue"
              ref={permissionsContainerRef}
            >
              {roleHat.canCreateProposals && (
                <RoleProposalPermissionBadge containerRef={permissionsContainerRef} />
              )}
            </GridItem>
          </Grid>
          <Divider
            variant="darker"
            my={4}
          />
          <RoleDetailsTabs
            hatId={roleHat.id}
            roleHatSmartAccountAddress={roleHat.smartAddress}
            roleTerms={roleHat.roleTerms}
            roleHatWearerAddress={roleHatWearerAddress}
            sortedPayments={sortedPayments}
          />
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
