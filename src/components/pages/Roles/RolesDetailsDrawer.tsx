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
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAddress, zeroAddress } from 'viem';
import { DAO_ROUTES } from '../../../constants/routes';
import { useGetDAOName } from '../../../hooks/DAO/useGetDAOName';
import useAvatar from '../../../hooks/utils/useAvatar';
import { useFractal } from '../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { DecentRoleHat, useRolesState } from '../../../state/useRolesState';
import { getChainIdFromPrefix } from '../../../utils/url';
import Avatar from '../../ui/page/Header/Avatar';
import { SablierVesting, SablierPayroll } from './types';

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
}: {
  roleHat: DecentRoleHat & { vestingData?: SablierVesting; payrollData?: SablierPayroll };
}) {
  const {
    node: { daoAddress },
  } = useFractal();
  const { hatsTree } = useRolesState();
  const { addressPrefix } = useNetworkConfig();
  const navigate = useNavigate();
  const { daoName: accountDisplayName } = useGetDAOName({
    address: getAddress(roleHat.wearer || zeroAddress),
    chainId: getChainIdFromPrefix(addressPrefix),
  });
  const avatarURL = useAvatar(roleHat.wearer || zeroAddress);
  const hatIndex = useMemo(() => {
    return hatsTree?.roleHats.findIndex(hat => hat.id === roleHat.id);
  }, [hatsTree, roleHat.id]);

  if (!daoAddress) return null;

  return (
    <Drawer
      isOpen
      placement="right"
      onClose={() => {
        navigate(DAO_ROUTES.roles.relative(addressPrefix, daoAddress));
      }}
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
              onClick={() => {
                navigate(DAO_ROUTES.roles.relative(addressPrefix, daoAddress));
              }}
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
                onClick={() => {
                  if (hatIndex === undefined) return;
                  navigate(
                    DAO_ROUTES.rolesEditDetails.relative(addressPrefix, daoAddress, hatIndex),
                  );
                }}
              />
            </Flex>
          </Flex>
          <Text
            textStyle="display-2xl"
            color="white-0"
            my="1rem"
          >
            Developer
          </Text>
          <Grid
            gridTemplateAreas={`"mLabel mValue"
            "dLabel dValue"`}
            gridRowGap="1rem"
            gridColumnGap="2rem"
          >
            <GridItem area="mLabel">
              <RoleAndDescriptionLabel
                label="Member"
                icon={User}
              />
            </GridItem>
            <GridItem area="dLabel">
              <RoleAndDescriptionLabel
                label="Description"
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
                Magna dolor in reprehenderit cillum. Nulla culpa dolor cupidatat voluptate excepteur
                aliquip fugiat aliquip. Eiusmod culpa aute amet minim excepteur aliqua.
              </Text>
            </GridItem>
          </Grid>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
