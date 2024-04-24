import { Box, BoxProps } from '@chakra-ui/react';

export default function Divider({
  variant = 'dark',
  ...rest
}: { variant?: 'light' | 'dark' } & BoxProps) {
  const isDark = variant === 'dark';
  return (
    <Box
      height="0"
      width="100%"
      borderTop="1px solid"
      borderTopColor={isDark ? 'neutral-1' : 'neutral-2'}
      borderBottom="1px solid"
      borderBottomColor={isDark ? 'neutral-3' : 'neutral-4'}
      {...rest}
    />
  );
}
