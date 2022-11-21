import { Flex, Text } from '@chakra-ui/react';
import { InfoBox } from './InfoBox';

export function EmptyBox({ emptyText }: { emptyText: string }) {
  return (
    <InfoBox>
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
      </Flex>
    </InfoBox>
  );
}
