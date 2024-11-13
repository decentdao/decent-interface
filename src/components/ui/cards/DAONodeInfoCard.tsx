import { Center, Flex, FlexProps, Link, Text, VStack } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { DAO_ROUTES } from '../../../constants/routes';
import { useGetAccountName } from '../../../hooks/utils/useGetAccountName';
import { useFractal } from '../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { FractalGuardContracts, FractalNode, FreezeGuard } from '../../../types';
import { SnapshotButton } from '../badges/Snapshot';
import { FavoriteIcon } from '../icons/FavoriteIcon';
import AddressCopier from '../links/AddressCopier';
import { BarLoader } from '../loaders/BarLoader';

export const NODE_HEIGHT_REM = 6.75;
export const NODE_MARGIN_TOP_REM = 1.25;

export interface InfoProps extends FlexProps {
  node?: FractalNode;
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
export function DAONodeInfoCard({ node, freezeGuard, guardContracts, ...rest }: InfoProps) {
  const {
    node: { safe: currentSafe }, // used ONLY to determine if we're on the current DAO
  } = useFractal();
  const { addressPrefix } = useNetworkConfig();
  // for non Fractal Safes
  const displayedAddress = node?.safe?.address;
  const { displayName } = useGetAccountName(displayedAddress);

  // node hasn't loaded yet
  if (!node || !displayedAddress) {
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

  const isCurrentDAO = displayedAddress === currentSafe?.address;

  return (
    <Link
      as={RouterLink}
      to={DAO_ROUTES.dao.relative(addressPrefix, displayedAddress)}
      _hover={{ textDecoration: 'none', cursor: isCurrentDAO ? 'default' : 'pointer' }}
      onClick={event => {
        if (isCurrentDAO) {
          event.preventDefault();
        }
      }}
    >
      <Flex
        minH={`${NODE_HEIGHT_REM}rem`}
        bg="neutral-2"
        _hover={
          !isCurrentDAO
            ? {
                bg: 'neutral-3',
                border: '1px solid',
                borderColor: 'neutral-4',
              }
            : {}
        }
        p="1.5rem"
        width="100%"
        borderRadius="0.75rem"
        border={isCurrentDAO ? '4px solid' : '1px'}
        borderColor={isCurrentDAO ? 'neutral-4' : 'transparent'}
      >
        <VStack
          gap="0.5rem"
          alignItems="left"
        >
          {/* DAO NAME */}
          <Flex
            gap="0.5rem"
            alignItems="center"
          >
            {/* DAO NAME */}

            <Text textStyle="display-xl">{node.daoName || displayName}</Text>

            {/* FAVORITE ICON */}
            <FavoriteIcon
              safeAddress={displayedAddress}
              data-testid="DAOInfo-favorite"
            />

            {/* SNAPSHOT ICON LINK */}
            {node.daoSnapshotENS && <SnapshotButton snapshotENS={node.daoSnapshotENS} />}
          </Flex>

          {/* DAO ADDRESS */}
          <AddressCopier address={displayedAddress} />
        </VStack>
      </Flex>
    </Link>
  );
}
