import { Box, Flex } from '@chakra-ui/react';
import { useMemo } from 'react';
import { NODE_HEIGHT_REM, NODE_MARGIN_TOP_REM } from '../../ui/cards/DAONodeRow';

interface INodeLine {
  isCurrentDAO?: boolean;
  trueDepth?: number;
  isFirstChild?: boolean;
  /**
   * The number of descendents of the last child, used to calculate
   * how much height to cut off the bottom of the vertical node line.
   */
  lastChildDescendants?: number;
}

export function NodeLineVertical({ isCurrentDAO, trueDepth = 0, lastChildDescendants }: INodeLine) {
  const lineHeight = useMemo(() => {
    return `calc(100% - ${
      (NODE_HEIGHT_REM + NODE_MARGIN_TOP_REM) * lastChildDescendants! + NODE_HEIGHT_REM / 2
    }rem)`;
  }, [lastChildDescendants]);

  return (
    <Box
      position="absolute"
      h={`calc(100% - ${NODE_HEIGHT_REM + NODE_MARGIN_TOP_REM}rem)`}
      w="100%"
      bottom={0}
      overflow="hidden"
    >
      <Box
        position="relative"
        height="100%"
      >
        <Box
          borderRadius="100%"
          boxSize="7px"
          ml="1.80rem"
          mb={1}
          position="absolute"
          zIndex={2}
          bg={isCurrentDAO && trueDepth === 0 ? 'gold.500' : 'chocolate.400'}
        />
        <Box
          position="absolute"
          h={lineHeight}
          bg="chocolate.400"
          mb="3.3rem"
          w="1px"
          ml={8}
        />
      </Box>
    </Box>
  );
}

export function NodeLineHorizontal({ isCurrentDAO, isFirstChild }: INodeLine) {
  if (isFirstChild) {
    return null;
  }
  return (
    <Flex
      w="50px"
      h="full"
      alignItems="center"
      position="absolute"
      justifyContent="center"
      left={-16}
      mt={-4}
    >
      <Box
        height="1px"
        bg={isCurrentDAO ? 'gold.500' : 'chocolate.400'}
        w="calc(100% - 6px)"
      />
      <Box
        borderRadius="100%"
        boxSize="6px"
        bg={isCurrentDAO ? 'gold.500' : 'chocolate.400'}
      />
    </Flex>
  );
}
