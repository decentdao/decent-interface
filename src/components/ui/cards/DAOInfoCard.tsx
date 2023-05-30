import { Box, Button, Flex, IconButton, Text, Image, Spacer } from '@chakra-ui/react';
import { ArrowDownSm, ArrowRightSm } from '@decent-org/fractal-ui';
import { utils } from 'ethers';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
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
import { INFOBOX_HEIGHT_REM, INFOBOX_PADDING_REM } from '../containers/InfoBox';
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

  const { t } = useTranslation(['common']);

  const isCurrentDAO = safeAddress === daoAddress;

  const canManageDAO = !!user.address;

  if (!safeAddress) return null;
  return (
    <Flex justifyContent="space-between">
      <Flex flexWrap="wrap">
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
        </Flex>
      </Flex>
      <Flex
        flexDirection="column"
        alignItems="end"
        minHeight={INFOBOX_HEIGHT_REM - INFOBOX_PADDING_REM * 2 + 'rem'}
      >
        {/* Vertical Elipsis */}
        {canManageDAO && (
          <ManageDAOMenu
            parentAddress={parentAddress}
            safeAddress={safeAddress}
            freezeGuard={freezeGuard}
            guardContracts={guardContracts}
          />
        )}
        <Spacer />
        {daoSnapshotURL && (
          <Button
            onClick={() => window.open(`https://snapshot.org/#/${daoSnapshotURL}`)}
            variant="secondary"
            mt={5}
            h={6}
            w={32}
          >
            <Image
              src="/images/snapshot-icon.svg"
              alt="snapshot icon"
              mr={1}
            />
            {t('snapshot', { ns: 'common' })}
          </Button>
        )}
      </Flex>
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
