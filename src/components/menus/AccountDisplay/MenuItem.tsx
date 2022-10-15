import { MenuItem as ChakraMenuItem } from '@chakra-ui/react';

export function MenuItem({ onClick, children }: { onClick?: () => void; children: JSX.Element }) {
  return (
    <ChakraMenuItem
      cursor={!!onClick ? 'pointer' : 'default'}
      p="4"
      onClick={onClick}
    >
      {children}
    </ChakraMenuItem>
  );
}
