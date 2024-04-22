import { Flex, Text, HStack, FlexProps, Link, Center, VStack } from '@chakra-ui/react';
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

export const NODE_HEIGHT_REM = 6.75;
export const NODE_MARGIN_TOP_REM = 1.25;

export interface InfoProps extends FlexProps {
  parentAddress?: string;
  node?: FractalNode;
  childCount?: number;
  freezeGuard?: FreezeGuard;
  guardContracts?: FractalGuardContracts;
}

/**
 * Info card used on each DAO in the hierarchy page.
 *
 * It is *very* important to understand that all DAO info needs to be passed into
 * this component, as this card is independent of your current DAO context, since
 * it is used in the hierarchy, where there are multiple DAO nodes being displayed.
 *
 * Simply using the useFractal() hook to get info will end up with the current DAO's
 * context being displayed in ALL the node cards in a hierarchy, which is incorrect.
 */
export function DAONodeInfoCard({
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

  // needed?
  // const border = isCurrentDAO ? { border: '1px solid', borderColor: 'neutral-4' } : undefined;

  return (
    <Flex
      minH={`${NODE_HEIGHT_REM}rem`}
      bg="neutral-2"
      p="1.5rem"
      width="100%"
      borderRadius="0.5rem"
      // position="relative"
      // {...border}
    >
      <VStack
        gap="0.5rem"
        alignItems={'left'}
      >
        {/* DAO NAME */}
        <Flex
          direction="row"
          alignItems={'center'}
        >
          <HStack>
            {/* DAO NAME */}
            <Link
              textStyle="display-xl"
              as={RouterLink}
              pointerEvents={isCurrentDAO ? 'none' : undefined}
              to={DAO_ROUTES.dao.relative(addressPrefix, displayedAddress)}
              _hover={{ textDecoration: 'none', color: 'lilac-0' }}
              onClick={() => {
                // if we're not on the current DAO, reset
                // the DAO data, so the one you're clicking
                // into will load properly
                if (!isCurrentDAO) {
                  action.resetDAO();
                }
              }}
            >
              <Text>{node.daoName || displayName}</Text>
            </Link>

            {/* FAVORITE ICON */}
            <FavoriteIcon
              safeAddress={displayedAddress}
              data-testid="DAOInfo-favorite"
            />

            {/* SNAPSHOT ICON LINK */}
            {node.daoSnapshotURL && <SnapshotButton snapshotURL={node.daoSnapshotURL} />}
          </HStack>
        </Flex>

        {/* DAO ADDRESS */}
        <AddressCopier address={displayedAddress} />
      </VStack>
    </Flex>
  );
}
