import { Box, Flex } from '@chakra-ui/react';

interface INodeLine {
  isCurrentDAO?: boolean;
  trueDepth?: number;
  isFirstChild?: boolean;
}

export function NodeLineVertical({ trueDepth = 0 }: INodeLine) {
  return (
    <>
      <Box
        position="absolute"
        h="100%"
        w="100%"
        zIndex={-1 - trueDepth}
        top={0}
        overflow="hidden"
      >
        <Box
          position="relative"
          height="100%"
        >
          <Box
            position="absolute"
            bottom={0}
            height="100%"
            bg="chocolate.400"
            mb="3.3rem"
            w="1px"
            ml={8}
          />
        </Box>
      </Box>
    </>
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
