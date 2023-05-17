import { Text, Image, Flex, FlexProps, VStack } from '@chakra-ui/react';

interface DAOActionProps extends FlexProps {
  iconSrc: string;
  title: string;
  desc: string;
}

export default function DAOAction({ iconSrc, title, desc, ...rest }: DAOActionProps) {
  return (
    <Flex {...rest}>
      <Image
        alignSelf="center"
        width="4.5rem"
        height="4.5rem"
        src={iconSrc}
        alt={title}
      />
      <VStack
        alignItems="start"
        paddingStart="1rem"
      >
        <Text
          color="grayscale.100"
          textStyle="text-lg-mono-bold"
        >
          {title}
        </Text>
        <Text color="grayscale.500">{desc}</Text>
      </VStack>
    </Flex>
  );
}
