import { Flex, Link, Text, VStack } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { Address } from 'viem';
import { DAO_ROUTES } from '../../../constants/routes';
import { useAccountFavorites } from '../../../hooks/DAO/loaders/useFavorites';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { SnapshotButton } from '../badges/Snapshot';
import { FavoriteIcon } from '../icons/FavoriteIcon';
import AddressCopier from '../links/AddressCopier';

export const NODE_HEIGHT_REM = 6.75;
export const NODE_MARGIN_TOP_REM = 1.25;

interface DAONodeInfoCardProps {
  node: {
    daoAddress: Address;
    daoName: string;
    daoSnapshotENS?: string;
  };
  isCurrentViewingDAO: boolean;
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
export function DAONodeInfoCard(props: DAONodeInfoCardProps) {
  const {
    node: { daoAddress, daoName, daoSnapshotENS },
    isCurrentViewingDAO,
  } = props;
  const { addressPrefix } = useNetworkConfig();

  const { toggleFavorite, isFavorite } = useAccountFavorites();

  return (
    <Link
      as={RouterLink}
      to={DAO_ROUTES.dao.relative(addressPrefix, daoAddress)}
      _hover={{ textDecoration: 'none', cursor: isCurrentViewingDAO ? 'default' : 'pointer' }}
      onClick={event => {
        if (isCurrentViewingDAO) {
          event.preventDefault();
        }
      }}
    >
      <Flex
        minH={`${NODE_HEIGHT_REM}rem`}
        bg="neutral-2"
        _hover={
          !isCurrentViewingDAO
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
        border={isCurrentViewingDAO ? '4px solid' : '1px'}
        borderColor={isCurrentViewingDAO ? 'neutral-4' : 'transparent'}
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

            <Text textStyle="display-xl">{daoName}</Text>

            {/* FAVORITE ICON */}
            <FavoriteIcon
              isFavorite={isFavorite(daoAddress)}
              toggleFavoriteCallback={() => toggleFavorite(daoAddress, daoName)}
              data-testid="DAOInfo-favorite"
            />

            {/* SNAPSHOT ICON LINK */}
            {daoSnapshotENS && <SnapshotButton snapshotENS={daoSnapshotENS} />}
          </Flex>

          {/* DAO ADDRESS */}
          <AddressCopier address={daoAddress} />
        </VStack>
      </Flex>
    </Link>
  );
}
