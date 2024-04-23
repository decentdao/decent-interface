import { Box } from '@chakra-ui/react';

export default function Divider() {
  return (
    <Box
      height="0"
      width="100%"
      borderTop="1px solid"
      borderTopColor="neutral-1"
      borderBottom="1px solid"
      borderBottomColor=" neutral-3"
    />
  );
}
