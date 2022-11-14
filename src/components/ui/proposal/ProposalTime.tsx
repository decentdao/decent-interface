import { Flex, Text } from '@chakra-ui/react';
import Clock from '../svg/Clock';

function ProposalTime({ deadline }: { deadline: number }) {
  return (
    <Flex className="flex">
      <Clock />
      <Flex
        flexWrap="wrap"
        px={2}
        gap={1}
        alignItems="start"
      >
        <Text>{deadline}</Text>
      </Flex>
    </Flex>
  );
}

export default ProposalTime;
