import { Flex, Text } from '@chakra-ui/react';
import { ReactNode } from 'react';
import { ActivityBox } from './ActivityBox';

export function EmptyBox({ emptyText, children }: { emptyText: string; children?: ReactNode }) {
  return (
    <ActivityBox>
      <Flex
        h="8rem"
        alignItems="center"
        justifyContent="center"
        flexWrap="wrap"
      >
        <Text
          textStyle="display-xl"
          color="neutral-7"
        >
          {emptyText}
        </Text>
        {children}
      </Flex>
    </ActivityBox>
  );
}
