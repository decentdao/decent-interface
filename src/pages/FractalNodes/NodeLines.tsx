import { Box, Flex } from '@chakra-ui/react';
import { useMemo } from 'react';

interface INodeLine {
  isCurrentDAO?: boolean;
  trueDepth?: number;
  isFirstChild?: boolean;
  numberOfSiblings?: number;
  numberOfChildren?: number;
}

const INFO_CARD_FULL_LENGTH = '7.45rem'; // + some margin
const INFO_CARD_HALF_LENGTH = `calc(${INFO_CARD_FULL_LENGTH} / 2)`;

export function NodeLineVertical({
  isCurrentDAO,
  trueDepth = 0,
  numberOfSiblings,
  numberOfChildren,
}: INodeLine) {
  const showFullLength = useMemo(
    () =>
      (numberOfSiblings && numberOfSiblings >= 1) || (numberOfChildren && numberOfChildren >= 2),
    [numberOfSiblings, numberOfChildren]
  );

  const lineHeight = useMemo(() => {
    if (showFullLength) {
      return '100%';
    }
    return INFO_CARD_HALF_LENGTH;
  }, [showFullLength]);

  return (
    <>
      <Box
        position="absolute"
        h={`calc(100% - ${INFO_CARD_FULL_LENGTH})`}
        w="100%"
        zIndex={-1 - trueDepth}
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
            ml="1.85rem"
            mb={1}
            position="absolute"
            zIndex={2}
            bg={isCurrentDAO && trueDepth === 0 ? 'gold.500' : 'chocolate.400'}
          />
          <Box
            position="absolute"
            bottom={showFullLength ? 0 : undefined}
            top={showFullLength ? undefined : 0}
            h={lineHeight}
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
