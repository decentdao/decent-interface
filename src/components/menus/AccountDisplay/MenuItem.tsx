import { MenuItem as ChakraMenuItem } from '@chakra-ui/react';

export function MenuItem({
  onClick,
  testId,
  children,
}: {
  testId: string;
  onClick?: () => void;
  children: JSX.Element;
}) {
  return (
    <ChakraMenuItem
      data-testid={testId}
      cursor={!!onClick ? 'pointer' : 'default'}
      p="4"
      onClick={onClick}
    >
      {children}
    </ChakraMenuItem>
  );
}
