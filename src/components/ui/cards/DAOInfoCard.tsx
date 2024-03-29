import { Box, Flex, Text, Spacer, HStack, FlexProps, Link, Center } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { DAO_ROUTES } from '../../../constants/routes';
import useDisplayName from '../../../hooks/utils/useDisplayName';
import { useFractal } from '../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { FreezeGuard, FractalGuardContracts, FractalNode } from '../../../types';
import Snapshot from '../badges/Snapshot';
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
 * Info card used on both the DAO homepage, as well as each DAO in the
 * hierarchy page.
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
    node: { daoAddress: currentDAOAddress }, // used ONLY to determine if we're on the current DAO
    action,
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
  const isCurrentDAO = displayedAddress === currentDAOAddress;

  return (
    <Flex
      w="full"
      minH="full"
      {...rest}
    >
      <Flex
        flexDirection="column"
        gap="0.4rem"
      >
        <HStack>
          <Link
            as={RouterLink}
            pointerEvents={isCurrentDAO ? 'none' : undefined}
            to={DAO_ROUTES.dao.relative(addressPrefix, displayedAddress)}
            _hover={{ textDecoration: 'none' }}
            onClick={() => {
              // if we're not on the current DAO, reset
              // the DAO data, so the one you're clicking
              // into will load properly
              if (!isCurrentDAO) {
                action.resetDAO();
              }
            }}
          >
            <Text
              as="h1"
              textStyle="text-2xl-mono-regular"
              color="grayscale.100"
              data-testid="DAOInfo-name"
              noOfLines={1}
            >
              {node.daoName || displayName}
            </Text>
          </Link>
          <FavoriteIcon
            safeAddress={displayedAddress}
            data-testid="DAOInfo-favorite"
          />
          {childCount && childCount > 0 && (
            <Link
              to={DAO_ROUTES.hierarchy.relative(addressPrefix, displayedAddress)}
              as={RouterLink}
            >
              <Box
                bg="chocolate.500"
                borderRadius="4px"
                p="0.25rem 0.5rem"
              >
                <Text textStyle="text-sm-mono-semibold">{childCount}</Text>
              </Box>
            </Link>
          )}
        </HStack>
        <AddressCopier address={displayedAddress} />
      </Flex>
      <Spacer />
      <Flex
        flexDirection="column"
        alignItems="end"
        justifyContent="space-between"
      >
        {!!user.address ? (
          <ManageDAOMenu
            parentAddress={parentAddress}
            fractalNode={node}
            freezeGuard={freezeGuard}
            guardContracts={guardContracts}
          />
        ) : (
          // empty box to keep snapshot bottom aligned
          <Box />
        )}
        {node.daoSnapshotURL && <Snapshot snapshotURL={node.daoSnapshotURL} />}
      </Flex>
    </Flex>
  );
}
