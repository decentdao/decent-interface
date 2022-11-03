import { Box, Flex, Text } from '@chakra-ui/react';
import { Copy, StarGoldSolid, StarOutline } from '@decent-org/fractal-ui';
import { Badge } from '../../../components/ui/badges/Badge';
import { useCopyText } from '../../../hooks/utlities/useCopyText';
import { useFractal } from '../../../providers/fractal/hooks/useFractal';

export function InfoDAO() {
  const {
    gnosis: { daoName },
  } = useFractal();
  const copyToClipboard = useCopyText();

  // @todo replace mocked values
  const MOCK_IS_FAVORITE = false;
  const MOCK_IS_SUB_DAO = false;
  const MOCK_DAO_ADDRESS = '0x2416...2560';

  return (
    <Box data-testid="dashboard-daoInfo">
      <Flex
        alignItems="center"
        gap="0.5rem"
        mb="1rem"
      >
        <Text
          as="h1"
          textStyle="text-2xl-mono-regular"
          color="grayscale.100"
        >
          {daoName || `DAO at ${MOCK_DAO_ADDRESS}`}
        </Text>
        {MOCK_IS_FAVORITE ? <StarGoldSolid boxSize="1.5rem" /> : <StarOutline boxSize="1.5rem" />}
        <Badge
          labelKey={MOCK_IS_SUB_DAO ? 'child' : 'parent'}
          size="sm"
        />
      </Flex>
      <Flex
        alignItems="center"
        onClick={() => copyToClipboard()}
        gap="0.5rem"
      >
        <Text
          textStyle="text-base-mono-regular"
          color="grayscale.100"
        >
          {MOCK_DAO_ADDRESS}
        </Text>
        <Copy />
      </Flex>
    </Box>
  );
}
