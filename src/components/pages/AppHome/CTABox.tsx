import { Box, BoxProps, Center, Flex } from '@chakra-ui/react';
import { ReactNode } from 'react';
import { BaseBox } from '../../ui/containers/BaseBox';

interface Props extends BoxProps {
  component1: ReactNode;
  component2: ReactNode;
}

export function CTABox({ component1, component2, ...rest }: Props) {
  return (
    <BaseBox
      w="100%"
      {...rest}
    >
      <Center>
        <Flex
          w="fit-content"
          alignSelf="center"
          padding="0.5rem"
          alignItems="center"
        >
          {component1}
          <Box w="2rem" />
          {component2}
        </Flex>
      </Center>
    </BaseBox>
  );
}
