import { Box, Flex, Text, Spacer, HStack, FlexProps, Link, Center, VStack } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { DAO_ROUTES } from '../../../constants/routes';
import useDisplayName from '../../../hooks/utils/useDisplayName';
import { useFractal } from '../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { FreezeGuard, FractalGuardContracts, FractalNode } from '../../../types';
import { SnapshotButton } from '../badges/Snapshot';
import FavoriteIcon from '../icons/FavoriteIcon';
import AddressCopier from '../links/AddressCopier';
import { BarLoader } from '../loaders/BarLoader';
import { ManageDAOMenu } from '../menus/ManageDAO/ManageDAOMenu';

export interface InfoProps extends FlexProps {
  parentAddress?: string;
  node?: FractalNode;
  childCount?: number;
  freezeGuard?: FreezeGuard;
  guardContracts?: FractalGuardContracts;
}

/**
 * Info card used on the DAO homepage.
 *
 * It is *very* important to understand that all DAO info needs to be passed into
 * this component, as this card is independent of your current DAO context, since
 * it is used in the hierarchy, where there are multiple DAO nodes being displayed.
 *
 * Simply using the useFractal() hook to get info will end up with the current DAO's
 * context being displayed in ALL the node cards in a hierarchy, which is incorrect.
 */
export function DAOInfoCard({
  parentAddress,
  node,
  childCount,
  freezeGuard,
  guardContracts,
  ...rest
}: InfoProps) {
  const {
    readOnly: { user },
  } = useFractal();
  const { addressPrefix } = useNetworkConfig();

  // for non Fractal Safes
  const { displayName } = useDisplayName(node?.daoAddress);

  // node hasn't loaded yet
  if (!node || !node.daoAddress) {
    return (
      <Flex
        w="full"
        minH="full"
        {...rest}
      >
        <Center w="100%">
          <BarLoader />
        </Center>
      </Flex>
    );
  }

  const displayedAddress = node.daoAddress;

  return (
    <Box {...rest}>
      <VStack
        gap="1.5rem"
        alignItems={'left'}
      >
        {/* DAO NAME AND ACTIONS */}
        <Flex
          direction="row"
          alignItems={'center'}
        >
          <HStack>
            {/* DAO NAME */}
            <Text
              textStyle="display-4xl"
              mr="0.5rem"
              data-testid="DAOInfo-name"
            >
              {node.daoName || displayName}
            </Text>

            {/* FAVORITE ICON */}
            <FavoriteIcon
              safeAddress={displayedAddress}
              data-testid="DAOInfo-favorite"
            />

            {/* PARENT TAG */}
            {childCount && childCount > 0 && (
              <Link
                to={DAO_ROUTES.hierarchy.relative(addressPrefix, displayedAddress)}
                as={RouterLink}
                borderWidth="1px"
                borderColor="transparent"
                _hover={{ textDecoration: 'none', bg: 'neutral-4' }}
                _active={{ bg: 'neutral-3', borderColor: 'neutral-4' }}
                bg="neutral-3"
                color="lilac-0"
                borderRadius="625rem"
                p="0.25rem 0.75rem"
                textStyle="button-base"
              >
                Parent
              </Link>
            )}
          </HStack>

          <Spacer />

          {!!user.address && (
            <ManageDAOMenu
              parentAddress={parentAddress}
              fractalNode={node}
              freezeGuard={freezeGuard}
              guardContracts={guardContracts}
            />
          )}
        </Flex>

        {/* DAO ADDRESS */}
        <AddressCopier address={displayedAddress} />

        {/* SNAPSHOT ICON LINK */}
        {node.daoSnapshotURL && <SnapshotButton snapshotURL={node.daoSnapshotURL} />}
      </VStack>
    </Box>
  );
}
