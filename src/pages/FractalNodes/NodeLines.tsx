import { Box } from '@chakra-ui/react';

export function NodeLines({
  hasMore,
  isFirstChild,
  extendHeight,
  indentfactor = 1,
}: {
  hasMore?: boolean;
  isFirstChild?: boolean;
  extendHeight?: boolean;
  indentfactor?: number;
}) {
  const width = (1.5 * indentfactor).toString() + 'rem';
  return (
    <Box>
      <Box
        ml="1.75rem"
        mr="1rem"
        width={width}
        h="3.375rem"
        borderLeft="1px solid"
        borderBottom="1px solid"
        borderColor="chocolate.400"
        position="relative"
      >
        {isFirstChild && (
          <Box
            borderRadius="100%"
            boxSize="8px"
            position="absolute"
            top="-4.5156245px"
            left="-4.5156245px"
            bg="chocolate.400"
          />
        )}
        <Box
          borderRadius="100%"
          boxSize="8px"
          position="absolute"
          bottom="-4.5156245px"
          right="-4.5156245px"
          bg="chocolate.400"
        />
      </Box>
      {hasMore && (
        <Box
          ml="1.75rem"
          width="1.5rem"
          h={extendHeight ? '4.375rem' : '3.375rem'}
          borderLeft="1px solid"
          borderColor="chocolate.400"
        />
      )}
    </Box>
  );
}
