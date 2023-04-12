import { Text, TextProps } from '@chakra-ui/react';
import { PropsWithChildren } from 'react';

export default function ExampleLabel({ children, ...rest }: PropsWithChildren<TextProps>) {
  return (
    <Text
      bg="chocolate.700"
      borderRadius="4px"
      px="4px"
      py="1px"
      color="grayscale.100"
      fontSize="12px"
      as="span"
      {...rest}
    >
      {children}
    </Text>
  );
}
