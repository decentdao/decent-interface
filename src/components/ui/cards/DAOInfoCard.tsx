import { Flex, IconButton, Text } from '@chakra-ui/react';
import { ArrowDownSm, StarGoldSolid, StarOutline, Copy, VEllipsis } from '@decent-org/fractal-ui';
import useDAOName from '../../../hooks/DAO/useDAOName';
import useDisplayName from '../../../hooks/useDisplayName';
import { useCopyText } from '../../../hooks/utlities/useCopyText';
import { useFractal } from '../../../providers/fractal/hooks/useFractal';

interface IDAOInfoCard {
  safeAddress: string;
}

export function DAOInfoCard({ safeAddress }: IDAOInfoCard) {
  const {
    account: {
      favorites: { isConnectedFavorited, toggleFavorite },
    },
  } = useFractal();
  const copyToClipboard = useCopyText();
  const { accountSubstring } = useDisplayName(safeAddress);
  const { daoRegistryName } = useDAOName({ address: safeAddress });
  return (
    <Flex
      alignItems="center"
      justifyContent="space-between"
      h="6.75rem"
      w="full"
      bg="black.900-semi-transparent"
      p="1rem"
      borderRadius="0.5rem"
    >
      <Flex alignItems="center">
        {/* CARET */}
        <IconButton
          variant="ghost"
          minWidth="0px"
          aria-label="Favorite Toggle"
          icon={
            <ArrowDownSm
              boxSize="1.5rem"
              mr="1.5rem"
            />
          }
        />
        {/* DAO NAME AND INFO */}
        <Flex flexDirection="column">
          <Flex
            alignItems="center"
            gap="1rem"
          >
            <Text
              as="h1"
              textStyle="text-2xl-mono-regular"
              color="grayscale.100"
            >
              {daoRegistryName}
            </Text>
            <IconButton
              variant="ghost"
              minWidth="0px"
              aria-label="Favorite Toggle"
              icon={
                isConnectedFavorited ? (
                  <StarGoldSolid boxSize="1.5rem" />
                ) : (
                  <StarOutline boxSize="1.5rem" />
                )
              }
              onClick={() => toggleFavorite(safeAddress)}
            />
          </Flex>
          <Flex
            alignItems="center"
            onClick={() => copyToClipboard(safeAddress)}
            gap="0.5rem"
          >
            <Text
              textStyle="text-base-mono-regular"
              color="grayscale.100"
            >
              {accountSubstring}
            </Text>
            <Copy />
          </Flex>
        </Flex>
      </Flex>
      {/* Veritical Elipsis */}
      <IconButton
        aria-label="dao-action-menu"
        variant="ghost"
        icon={<VEllipsis boxSize="1.5rem" />}
      />
    </Flex>
  );
}
