import { Flex, Text } from '@chakra-ui/react';
import { ReactNode } from 'react';
import { InfoBox } from './InfoBox';

export function EmptyBox({
  emptyText,
  children,
  ...rest
}: {
  emptyText: string;
  children?: ReactNode;
  m?: string | number;
}) {
  return (
    <InfoBox {...rest}>
      <Flex
        h="8rem"
        alignItems="center"
        justifyContent="center"
      >
        <Text
          textStyle="text-xl-mono-bold"
          color="chocolate.100"
        >
          {emptyText}
        </Text>
        {children}
      </Flex>
    </InfoBox>
  );
}
