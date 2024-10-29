import { Box, Center, Flex, Link, Text } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { DAO_ROUTES } from '../../../constants/routes';
import { useGetAccountName } from '../../../hooks/utils/useGetAccountName';
import { useFractal } from '../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { SnapshotButton } from '../badges/Snapshot';
import { FavoriteIcon } from '../icons/FavoriteIcon';
import AddressCopier from '../links/AddressCopier';
import { BarLoader } from '../loaders/BarLoader';
import { ManageDAOMenu } from '../menus/ManageDAO/ManageDAOMenu';

/**
 * Info card used on the DAO homepage.
 */
export function DAOInfoCard() {
  const { node } = useFractal();

  const { addressPrefix } = useNetworkConfig();
  // for non Fractal Safes
  const { displayName } = useGetAccountName(node?.daoAddress);

  // node hasn't loaded yet
  if (!node || !node.daoAddress) {
    return (
      <Flex
        w="full"
        minH="full"
      >
        <Center w="100%">
          <BarLoader />
        </Center>
      </Flex>
    );
  }

  const displayedAddress = node.daoAddress;

  return (
    <Box>
      <Flex
        direction="column"
        gap="1.5rem"
      >
        <Flex
          alignItems="center"
          columnGap="0.5rem"
          justifyContent="space-between"
          mt="0.5rem"
          flexGrow={1}
        >
          <Flex
            alignItems="center"
            columnGap="0.5rem"
          >
            {/* FAVORITE ICON */}
            <FavoriteIcon safeAddress={displayedAddress} />

            {/* PARENT TAG */}
            {node.nodeHierarchy.childNodes.length > 0 && (
              <Link
                to={DAO_ROUTES.hierarchy.relative(addressPrefix, displayedAddress)}
                as={RouterLink}
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
          </Flex>
          <ManageDAOMenu />
        </Flex>
        {/* DAO NAME AND ACTIONS */}

        <Flex
          alignItems="flex-start"
          columnGap="0.5rem"
        >
          {/* DAO NAME */}
          <Text
            textStyle="display-4xl"
            data-testid="DAOInfo-name"
          >
            {node.daoName || displayName}
          </Text>
        </Flex>

        {/* DAO ADDRESS */}
        <AddressCopier address={displayedAddress} />

        {/* SNAPSHOT ICON LINK */}
        {node.daoSnapshotENS && <SnapshotButton snapshotENS={node.daoSnapshotENS} />}
      </Flex>
    </Box>
  );
}
