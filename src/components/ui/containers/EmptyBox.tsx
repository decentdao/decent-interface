import { Flex, Text } from '@chakra-ui/react';
import { ReactNode } from 'react';
import { ActivityBox } from './ActivityBox';

export function EmptyBox({
  emptyText,
  children,
}: {
  emptyText: string;
  children?: ReactNode;
  m?: string | number;
}) {
  return (
    <ActivityBox>
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
    </ActivityBox>
  );
}
