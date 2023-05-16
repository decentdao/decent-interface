import { Box, Button, Flex, IconButton, Text, Image } from '@chakra-ui/react';
import { ArrowDownSm, ArrowRightSm } from '@decent-org/fractal-ui';
import { utils } from 'ethers';
import Link from 'next/link';
import { BACKGROUND_SEMI_TRANSPARENT } from '../../../constants/common';
import { DAO_ROUTES } from '../../../constants/routes';
import { useSubDAOData } from '../../../hooks/DAO/useSubDAOData';
import { useFractal } from '../../../providers/App/AppProvider';
import {
  SafeInfoResponseWithGuard,
  FreezeGuard,
  FractalGuardContracts,
  FractalNode,
} from '../../../types';
import { NodeLineHorizontal } from '../../pages/DaoHierarchy/NodeLines';
import FavoriteIcon from '../icons/FavoriteIcon';
import AddressCopier from '../links/AddressCopier';
import { ManageDAOMenu } from '../menus/ManageDAO/ManageDAOMenu';

interface IDAOInfoCard {
  parentAddress?: string | null;
  subDAOSafeInfo?: SafeInfoResponseWithGuard;
  safeAddress: string | null;
  toggleExpansion?: () => void;
  expanded?: boolean;
  numberOfChildrenDAO?: number;
  viewChildren?: boolean;
  depth?: number;
  fractalNode?: FractalNode;
}

export function DAOInfoCard({
  parentAddress,
  safeAddress,
  toggleExpansion,
  expanded,
  numberOfChildrenDAO,
  freezeGuard,
  guardContracts,
  fractalNode,
}: IDAOInfoCard & { freezeGuard?: FreezeGuard; guardContracts: FractalGuardContracts }) {
  const {
    node: { daoAddress, daoName, daoSnapshotURL },
    action,
    readOnly: { user },
  } = useFractal();

  const isCurrentDAO = safeAddress === daoAddress;

  const canManageDAO = !!user.address;

  if (!safeAddress) return null;
  return (
    <Flex
      justifyContent="space-between"
      flexGrow={1}
    >
      <Flex
        alignItems="center"
        flexWrap="wrap"
      >
        {!!toggleExpansion && (
          <IconButton
            variant="ghost"
            minWidth="0px"
            aria-label="Favorite Toggle"
            icon={
              expanded ? (
                <ArrowDownSm
                  boxSize="1.5rem"
                  mr="1.5rem"
                />
              ) : (
                <ArrowRightSm
                  boxSize="1.5rem"
                  mr="1.5rem"
                />
              )
            }
            onClick={toggleExpansion}
          />
        )}
        {/* DAO NAME AND INFO */}
        <Flex
          flexDirection="column"
          gap="0.5rem"
        >
          <Flex
            alignItems="center"
            gap="0.5rem"
            flexWrap="wrap"
          >
            <Link
              href={DAO_ROUTES.dao.relative(safeAddress)}
              onClick={() => {
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
              >
                {fractalNode?.daoName || daoName}
              </Text>
            </Link>
            <FavoriteIcon
              safeAddress={safeAddress}
              data-testid="DAOInfo-favorite"
            />
            {!!numberOfChildrenDAO && (
              <Link href={DAO_ROUTES.hierarchy.relative(safeAddress)}>
                <Box
                  bg="chocolate.500"
                  borderRadius="4px"
                  p="0.25rem 0.5rem"
                >
                  <Text textStyle="text-sm-mono-semibold">{numberOfChildrenDAO}</Text>
                </Box>
              </Link>
            )}
          </Flex>
          <AddressCopier address={safeAddress} />
          <Button
            onClick={() => window.open(`https://demo.snapshot.org/#/${daoSnapshotURL}`)}
            variant="secondary"
            mt={5}
          >
            <Image
              src="/images/snapshot-icon.svg"
              alt="snapshot icon"
              mr={1}
            />
            SnapShot
          </Button>
        </Flex>
      </Flex>
      {/* Veritical Elipsis */}
      {canManageDAO && (
        <ManageDAOMenu
          parentAddress={parentAddress}
          safeAddress={safeAddress}
          freezeGuard={freezeGuard}
          guardContracts={guardContracts}
        />
      )}
    </Flex>
  );
}

export function DAONodeCard(props: IDAOInfoCard) {
  const {
    node: { daoAddress: currentDAOAddress },
    guardContracts,
    guard,
  } = useFractal();
  const isCurrentDAO = utils.getAddress(props.safeAddress || '') === currentDAOAddress;
  const { subDAOData } = useSubDAOData(
    !isCurrentDAO && props.fractalNode ? props.fractalNode : undefined
  );

  const nodeGuardContracts =
    !isCurrentDAO && !!subDAOData ? subDAOData.freezeGuardContracts : guardContracts;
  const nodeFreezeGuard =
    !isCurrentDAO && !!subDAOData ? subDAOData.freezeGuard : !isCurrentDAO ? undefined : guard;
  const border = isCurrentDAO ? { border: '1px solid', borderColor: 'drab.500' } : undefined;

  return (
    <Flex
      mt="1rem"
      minH="6.75rem"
      bg={BACKGROUND_SEMI_TRANSPARENT}
      p="1rem"
      borderRadius="0.5rem"
      flex={1}
      position="relative"
      {...border}
    >
      <NodeLineHorizontal
        isCurrentDAO={isCurrentDAO}
        isFirstChild={props.depth === 0 && props.parentAddress !== currentDAOAddress}
      />
      <DAOInfoCard
        {...props}
        guardContracts={nodeGuardContracts}
        freezeGuard={nodeFreezeGuard}
      />
    </Flex>
  );
}
