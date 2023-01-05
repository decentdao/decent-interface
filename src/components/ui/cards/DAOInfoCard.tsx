import { Box, Flex, IconButton, Text } from '@chakra-ui/react';
import {
  ArrowDownSm,
  StarGoldSolid,
  StarOutline,
  Copy,
  ArrowRightSm,
} from '@decent-org/fractal-ui';
import { Link } from 'react-router-dom';
import { BACKGROUND_SEMI_TRANSPARENT } from '../../../constants/common';
import useDAOName from '../../../hooks/DAO/useDAOName';
import { useSubDAOData } from '../../../hooks/DAO/useSubDAOData';
import { useCopyText } from '../../../hooks/utils/useCopyText';
import useDisplayName from '../../../hooks/utils/useDisplayName';
import { useFractal } from '../../../providers/Fractal/hooks/useFractal';
import { IGnosisFreezeData, IGnosisVetoContract } from '../../../providers/Fractal/types';
import { useWeb3Provider } from '../../../providers/Web3Data/hooks/useWeb3Provider';
import { DAO_ROUTES } from '../../../routes/constants';
import { ManageDAOMenu } from '../menus/ManageDAO/ManageDAOMenu';

interface IDAOInfoCard {
  safeAddress: string;
  toggleExpansion?: () => void;
  expanded?: boolean;
  numberOfChildrenDAO?: number;
  viewChildren?: boolean;
}

export function DAOInfoCard({
  safeAddress,
  toggleExpansion,
  expanded,
  numberOfChildrenDAO,
  freezeData,
  guardContracts,
}: IDAOInfoCard & { freezeData?: IGnosisFreezeData; guardContracts: IGnosisVetoContract }) {
  const {
    gnosis: {
      safe: { address },
      daoName,
    },
    account: {
      favorites: { favoritesList, toggleFavorite },
    },
  } = useFractal();
  const {
    state: { account },
  } = useWeb3Provider();
  const copyToClipboard = useCopyText();
  const { daoRegistryName } = useDAOName({
    address: address !== safeAddress ? safeAddress : undefined,
  });
  const { accountSubstring } = useDisplayName(safeAddress);
  const isFavorite = favoritesList.includes(safeAddress);

  // @todo add viewable conditions
  const canManageDAO = !!account;
  return (
    <Flex
      justifyContent="space-between"
      w="full"
    >
      <Flex alignItems="center">
        {/* CARET */}
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
            <Link to={DAO_ROUTES.dao.relative(safeAddress)}>
              <Text
                as="h1"
                textStyle="text-2xl-mono-regular"
                color="grayscale.100"
                data-testid="DAOInfo-name"
              >
                {daoRegistryName || daoName}
              </Text>
            </Link>
            <IconButton
              variant="ghost"
              minWidth="0px"
              aria-label="Favorite Toggle"
              icon={
                isFavorite ? <StarGoldSolid boxSize="1.5rem" /> : <StarOutline boxSize="1.5rem" />
              }
              onClick={() => toggleFavorite(safeAddress)}
            />
            {!!numberOfChildrenDAO && (
              <Box
                bg="chocolate.500"
                borderRadius="4px"
                p="0.25rem 0.5rem"
              >
                <Text textStyle="text-sm-mono-semibold">{numberOfChildrenDAO}</Text>
              </Box>
            )}
          </Flex>
          <Flex
            alignItems="center"
            onClick={() => copyToClipboard(safeAddress)}
            gap="0.5rem"
            cursor="pointer"
          >
            <Text
              textStyle="text-base-mono-regular"
              color="grayscale.100"
            >
              {accountSubstring}
            </Text>
            <Copy boxSize="1.5rem" />
          </Flex>
        </Flex>
      </Flex>
      {/* Veritical Elipsis */}
      {canManageDAO && (
        <ManageDAOMenu
          safeAddress={safeAddress}
          freezeData={freezeData}
          guardContracts={guardContracts}
        />
      )}
    </Flex>
  );
}

export function DAONodeCard(props: IDAOInfoCard) {
  const {
    gnosis: { safe, guardContracts, freezeData },
  } = useFractal();
  const isCurrentDAO = props.safeAddress === safe.address;
  const { subDAOData } = useSubDAOData(!isCurrentDAO ? props.safeAddress : undefined);
  const border = isCurrentDAO ? { border: '1px solid', borderColor: 'drab.500' } : undefined;

  const nodeGuardContracts =
    !isCurrentDAO && !!subDAOData ? subDAOData.vetoGuardContracts : guardContracts;
  const nodeFreezeData = !isCurrentDAO && !!subDAOData ? subDAOData.freezeData : freezeData;

  return (
    <Box
      h="6.75rem"
      bg={BACKGROUND_SEMI_TRANSPARENT}
      p="1rem"
      borderRadius="0.5rem"
      w="full"
      {...border}
    >
      <DAOInfoCard
        {...props}
        guardContracts={nodeGuardContracts}
        freezeData={nodeFreezeData}
      />
    </Box>
  );
}
