import { Box, BoxProps } from '@chakra-ui/react';

export default function Divider({
  variant = 'dark',
  ...rest
}: { variant?: 'light' | 'dark' | 'darker' } & BoxProps) {
  const isDark = variant === 'dark';
  const isDarker = variant === 'darker';
  // @todo - This divider should be removed and we should be using the one directly from Chakra
  // But we need proper styling on theme level
  return (
    <Box
      height="0"
      width="100%"
      borderTop="1px solid"
      borderTopColor={isDarker ? '#000000AD' : isDark ? 'neutral-1' : 'neutral-2'}
      borderBottom="1px solid"
      borderBottomColor={isDarker ? '#FFFFFF0A' : isDark ? 'neutral-3' : 'neutral-4'}
      {...rest}
    />
  );
}
