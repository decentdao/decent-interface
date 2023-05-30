import { BoxProps, Center, Flex } from '@chakra-ui/react';
import { ReactNode } from 'react';
import { StyledBox } from '../../ui/containers/StyledBox';

interface Props extends BoxProps {
  leftSlot: ReactNode;
  rightSlot: ReactNode;
}

export function CTABox({ leftSlot, rightSlot, ...rest }: Props) {
  return (
    <StyledBox
      w="100%"
      {...rest}
    >
      <Center>
        <Flex
          padding="0.5rem"
          alignItems="center"
          flexWrap="wrap"
          gap="2rem"
        >
          {leftSlot}
          {rightSlot}
        </Flex>
      </Center>
    </StyledBox>
  );
}
