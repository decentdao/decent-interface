import {
  Drawer,
  DrawerBody,
  DrawerContent,
  Flex,
  Grid,
  GridItem,
  Icon,
  IconButton,
  Text,
} from '@chakra-ui/react';
import { List, PencilLine, User, X } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { Address, Hex, getAddress } from 'viem';
import { useGetDAOName } from '../../../hooks/DAO/useGetDAOName';
import useAvatar from '../../../hooks/utils/useAvatar';
import PaymentDetails from '../../../pages/daos/[daoAddress]/roles/details/PaymentDetails';
import { useFractal } from '../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import Avatar from '../../ui/page/Header/Avatar';
import { SablierPayment } from './types';

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
  roleHat: {
    id: Hex;
    name: string;
    wearer: string;
    description: string;
    smartAddress: Address;
  };
  payments?: SablierPayment[];
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
  payments,
}: RoleDetailsDrawerProps) {
  const {
    node: { safe },
  } = useFractal();

  const { chain } = useNetworkConfig();
  const { t } = useTranslation(['roles']);
  const { daoName: accountDisplayName } = useGetDAOName({
    address: getAddress(roleHat.wearer),
    chainId: chain.id,
  });
  const avatarURL = useAvatar(roleHat.wearer);

  if (!safe?.address) return null;

  return (
    <Drawer
      placement="right"
      onClose={onClose ?? (() => {})}
      isOpen={isOpen}
    >
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
                  address={roleHat.wearer}
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
          {/* @todo: proper styling here */}
          <PaymentDetails
            payment={payments?.[0]}
            roleHat={roleHat}
          />
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
