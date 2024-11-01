import {
  Box,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerOverlay,
  Flex,
  Grid,
  GridItem,
  Icon,
  IconButton,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from '@chakra-ui/react';
import { List, PencilLine, User, X } from '@phosphor-icons/react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Address } from 'viem';
import { BACKGROUND_SEMI_TRANSPARENT } from '../../../constants/common';
import useAddress from '../../../hooks/utils/useAddress';
import useAvatar from '../../../hooks/utils/useAvatar';
import { useCanUserCreateProposal } from '../../../hooks/utils/useCanUserSubmitProposal';
import { useGetAccountName } from '../../../hooks/utils/useGetAccountName';
import { useFractal } from '../../../providers/App/AppProvider';
import {
  paymentSorterByActiveStatus,
  paymentSorterByStartDate,
  paymentSorterByWithdrawAmount,
} from '../../../store/roles/rolesStoreUtils';
import { BarLoader } from '../../ui/loaders/BarLoader';
import Avatar from '../../ui/page/Header/Avatar';
import Divider from '../../ui/utils/Divider';
import { RolePaymentDetails } from './RolePaymentDetails';
import { RoleDetailsDrawerProps, SablierPayment } from './types';

function NoDataCard({
  emptyText,
  emptyTextNotProposer,
}: {
  emptyText: string;
  emptyTextNotProposer?: string;
}) {
  const { t } = useTranslation(['roles']);
  const { canUserCreateProposal } = useCanUserCreateProposal();
  return (
    <Box
      bg="neutral-2"
      boxShadow="0px 0px 0px 1px #100414, inset 0px 0px 0px 1px rgba(248, 244, 252, 0.04), inset 0px 1px 0px rgba(248, 244, 252, 0.04)"
      borderRadius="0.75rem"
      p="1rem"
    >
      <Text
        textStyle="body-base"
        textAlign="center"
        color="neutral-6"
      >
        {t(
          emptyTextNotProposer
            ? canUserCreateProposal
              ? emptyText
              : emptyTextNotProposer
            : emptyText,
        )}
      </Text>
    </Box>
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

function RolesDetailsPayments({
  payments,
  roleHatSmartAddress,
  roleHatWearerAddress,
  roleTerms,
}: {
  payments: (Omit<SablierPayment, 'contractAddress' | 'streamId'> & {
    contractAddress?: Address;
    streamId?: string;
  })[];
  roleHatWearerAddress: Address | undefined;
  roleHatSmartAddress: Address | undefined;
  roleTerms: {
    termEndDate: Date;
    termNumber: number;
  }[];
}) {
  const { t } = useTranslation(['roles']);
  const sortedPayments = useMemo(
    () =>
      payments
        ? [...payments]
            .sort(paymentSorterByWithdrawAmount)
            .sort(paymentSorterByStartDate)
            .sort(paymentSorterByActiveStatus)
        : [],
    [payments],
  );

  if (!sortedPayments.length) {
    return (
      <NoDataCard
        emptyText="noActivePayments"
        emptyTextNotProposer="noActivePaymentsNotProposer"
      />
    );
  }

  return (
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
          roleHatSmartAddress={roleHatSmartAddress}
          roleTerms={roleTerms}
          roleHatWearerAddress={roleHatWearerAddress}
          showWithdraw
        />
      ))}
    </>
  );
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
                {loadingRoleHatWearerAddress || !roleHatWearerAddress ? (
                  <BarLoader />
                ) : (
                  <Avatar
                    size="icon"
                    address={roleHatWearerAddress}
                    url={avatarURL}
                  />
                )}
                <Text
                  textStyle="body-base"
                  color="white-0"
                >
                  {displayName}
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
          <Divider
            variant="darker"
            my={4}
          />
          <Tabs
            variant="twoTone"
            mt={4}
          >
            <TabList>
              <Tab>{t('terms')}</Tab>
              <Tab>{t('payments')}</Tab>
            </TabList>
            <TabPanels mt={4}>
              <TabPanel>{/* Terms content goes here */}</TabPanel>
              <TabPanel>
                <RolesDetailsPayments
                  payments={sortedPayments}
                  roleTerms={roleHat.roleTerms.allTerms.map(term => ({
                    termEndDate: term.termEndDate,
                    termNumber: term.termNumber,
                  }))}
                  roleHatSmartAddress={roleHat.smartAddress}
                  roleHatWearerAddress={roleHatWearerAddress}
                />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
