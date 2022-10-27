import { Box, Flex, Text } from '@chakra-ui/react';
import { Copy, StarGoldSolid, StarOutline } from '@decent-org/fractal-ui';
import { Badge } from '../../components/ui/badges/Badge';
import { useCopyText } from '../../hooks/utlities/useCopyText';

export function InfoDAO() {
  const isFavorite = false;
  const isSubDAO = false;
  const daoAddress = '0x2416...2560';
  const copyToClipboard = useCopyText();
  return (
    <Box>
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
          ParentDAO Name
        </Text>
        {isFavorite ? <StarGoldSolid boxSize="1.5rem" /> : <StarOutline boxSize="1.5rem" />}
        <Badge
          labelKey={isSubDAO ? 'child' : 'parent'}
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
          {daoAddress}
        </Text>
        <Copy />
      </Flex>
    </Box>
  );
}
